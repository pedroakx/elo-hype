-- Rode este script no SQL Editor do Supabase DEPOIS do extras-schema.sql
--
-- Substitui a tabela de preços por uma nova, com valor fixo POR DIVISÃO
-- (em vez de "total do tier ÷ 3"), degraus específicos e crescentes no
-- Diamante, e desconto proporcional aos LPs que o cliente já tem feito
-- na divisão atual.

-- 1. Coluna com os LPs atuais do cliente na divisão em que está agora
--    (0 a 99 — só faz sentido pra Elo Boost/Duo Boost)
alter table public.pedidos
  add column if not exists lp_atual integer check (lp_atual is null or (lp_atual >= 0 and lp_atual <= 99));

-- 2. Nova função de cálculo de preço — espelha exatamente src/data/pricing.js
create or replace function public.calcular_preco_pedido(
  p_servico text,
  p_elo_atual text,
  p_elo_desejado text,
  p_quantidade integer,
  p_extras jsonb default '[]'::jsonb,
  p_lp_atual integer default 0
) returns numeric as $$
declare
  elos text[] := array[
    'Ferro IV','Ferro III','Ferro II','Ferro I',
    'Bronze IV','Bronze III','Bronze II','Bronze I',
    'Prata IV','Prata III','Prata II','Prata I',
    'Ouro IV','Ouro III','Ouro II','Ouro I',
    'Platina IV','Platina III','Platina II','Platina I',
    'Esmeralda IV','Esmeralda III','Esmeralda II','Esmeralda I',
    'Diamante IV','Diamante III','Diamante II','Diamante I',
    'Mestre','Grão-Mestre','Desafiante'
  ];

  -- Preço fixo por divisão (Ferro a Esmeralda)
  preco_divisao jsonb := '{"Ferro":13,"Bronze":15,"Prata":17,"Ouro":20,"Platina":25,"Esmeralda":40}'::jsonb;

  -- id -> {tipo, valor}, tem que bater com EXTRAS em src/data/pricing.js
  extras_config jsonb := '{
    "prioridade":   {"tipo":"percentual","valor":20},
    "campeoes":     {"tipo":"fixo","valor":15},
    "rota":         {"tipo":"fixo","valor":10},
    "offline":      {"tipo":"fixo","valor":10},
    "especialista": {"tipo":"percentual","valor":25},
    "discord_live": {"tipo":"fixo","valor":20}
  }'::jsonb;

  idx_atual int;
  idx_desejado int;
  total numeric := 0;
  i int;
  elo_de text;
  elo_para text;
  tier_destino text;
  preco_etapa numeric;
  lp numeric;
  fator numeric := 1;
  soma_fixa numeric := 0;
  extra_id text;
  extra_cfg jsonb;
begin
  if p_servico in ('elo-boost', 'duo-boost') then
    idx_atual := array_position(elos, p_elo_atual);
    idx_desejado := array_position(elos, p_elo_desejado);

    if idx_atual is null or idx_desejado is null or idx_desejado <= idx_atual then
      return null;
    end if;

    lp := least(greatest(coalesce(p_lp_atual, 0), 0), 99);

    for i in idx_atual .. (idx_desejado - 1) loop
      elo_de := elos[i];
      elo_para := elos[i + 1];

      if elo_de = 'Diamante IV' and elo_para = 'Diamante III' then
        preco_etapa := 60;
      elsif elo_de = 'Diamante III' and elo_para = 'Diamante II' then
        preco_etapa := 70;
      elsif elo_de = 'Diamante II' and elo_para = 'Diamante I' then
        preco_etapa := 80;
      elsif elo_de = 'Diamante I' and elo_para = 'Mestre' then
        preco_etapa := 100;
      elsif elo_de = 'Mestre' and elo_para = 'Grão-Mestre' then
        preco_etapa := 1300;
      elsif elo_de = 'Grão-Mestre' and elo_para = 'Desafiante' then
        preco_etapa := 5000;
      elsif elo_para = 'Diamante IV' then
        -- Entrando no Diamante vindo do Esmeralda I: usa o preço do
        -- primeiro degrau do Diamante
        preco_etapa := 60;
      else
        tier_destino := split_part(elo_para, ' ', 1);
        preco_etapa := (preco_divisao ->> tier_destino)::numeric;
      end if;

      if preco_etapa is null then
        return null;
      end if;

      -- O primeiro degrau é cobrado proporcional ao que falta (100 - lp)%;
      -- os degraus seguintes são cobrados inteiros
      if i = idx_atual then
        total := total + preco_etapa * (100 - lp) / 100;
      else
        total := total + preco_etapa;
      end if;
    end loop;

    if p_servico = 'duo-boost' then
      total := total * 1.65;
    end if;

  elsif p_servico in ('coaching', 'placement') then
    if p_quantidade is null or p_quantidade <= 0 then
      return null;
    end if;

    total := p_quantidade * (case when p_servico = 'coaching' then 60 else 25 end);

  else
    return null;
  end if;

  -- Aplica os extras selecionados (ignora qualquer id desconhecido)
  if p_extras ? 'offline' and p_extras ? 'discord_live' then
    raise exception 'Não é possível combinar "modo offline" com "transmissão ao vivo no Discord".';
  end if;

  for extra_id in select jsonb_array_elements_text(coalesce(p_extras, '[]'::jsonb))
  loop
    extra_cfg := extras_config -> extra_id;
    if extra_cfg is not null then
      if extra_cfg ->> 'tipo' = 'percentual' then
        fator := fator * (1 + (extra_cfg ->> 'valor')::numeric / 100);
      else
        soma_fixa := soma_fixa + (extra_cfg ->> 'valor')::numeric;
      end if;
    end if;
  end loop;

  return round(total * fator + soma_fixa, 2);
end;
$$ language plpgsql immutable;

-- 3. Passa o LP atual pro cálculo no momento do INSERT
create or replace function public.handle_pedido_insert()
returns trigger as $$
declare
  preco_calculado numeric;
begin
  preco_calculado := public.calcular_preco_pedido(
    NEW.servico, NEW.elo_atual, NEW.elo_desejado, NEW.quantidade, NEW.extras, NEW.lp_atual
  );

  if preco_calculado is null then
    raise exception 'Não foi possível calcular o preço deste pedido. Confira os dados enviados.';
  end if;

  NEW.preco := preco_calculado;
  NEW.status := 'pendente';
  NEW.payment_status := 'pendente';
  NEW.booster_id := null;
  NEW.mp_preference_id := null;
  NEW.mp_payment_id := null;
  NEW.comissao_percentual := null;
  NEW.comissao_valor := null;

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_pedido_insert on public.pedidos;

create trigger on_pedido_insert
  before insert on public.pedidos
  for each row execute procedure public.handle_pedido_insert();
