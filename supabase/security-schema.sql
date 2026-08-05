-- Rode este script no SQL Editor do Supabase DEPOIS do ranking-schema.sql
--
-- PROBLEMA QUE ISSO RESOLVE: hoje o preço de cada pedido é calculado no
-- navegador (src/data/pricing.js) e enviado como parte do INSERT. Um
-- usuário mal-intencionado pode alterar esse valor antes de enviar
-- (via DevTools ou interceptando a requisição) e pagar menos do que
-- deveria. A partir daqui, o PREÇO É SEMPRE RECALCULADO PELO BANCO,
-- ignorando qualquer valor que o cliente tente enviar.

-- 1. Coluna dedicada pra quantidade (Coaching/Placement), em vez de
--    depender de texto solto dentro de "observações"
alter table public.pedidos
  add column if not exists quantidade integer;

-- 2. Função que recalcula o preço no servidor, espelhando exatamente
--    a mesma tabela de preços do front-end (src/data/pricing.js)
create or replace function public.calcular_preco_pedido(
  p_servico text,
  p_elo_atual text,
  p_elo_desejado text,
  p_quantidade integer
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
  preco_tier jsonb := '{"Ferro":40,"Bronze":45,"Prata":55,"Ouro":70,"Platina":100,"Esmeralda":190,"Diamante":310}'::jsonb;
  idx_atual int;
  idx_desejado int;
  total numeric := 0;
  i int;
  elo_de text;
  elo_para text;
  tier_destino text;
begin
  if p_servico in ('elo-boost', 'duo-boost') then
    idx_atual := array_position(elos, p_elo_atual);
    idx_desejado := array_position(elos, p_elo_desejado);

    if idx_atual is null or idx_desejado is null or idx_desejado <= idx_atual then
      return null;
    end if;

    for i in idx_atual .. (idx_desejado - 1) loop
      elo_de := elos[i];
      elo_para := elos[i + 1];

      if elo_de = 'Diamante I' and elo_para = 'Mestre' then
        total := total + 140;
      elsif elo_de = 'Mestre' and elo_para = 'Grão-Mestre' then
        total := total + 1300;
      elsif elo_de = 'Grão-Mestre' and elo_para = 'Desafiante' then
        total := total + 5000;
      else
        tier_destino := split_part(elo_para, ' ', 1);
        total := total + (preco_tier ->> tier_destino)::numeric / 3;
      end if;
    end loop;

    if p_servico = 'duo-boost' then
      total := total * 1.65;
    end if;

    return round(total, 2);
  end if;

  if p_servico in ('coaching', 'placement') then
    if p_quantidade is null or p_quantidade <= 0 then
      return null;
    end if;

    if p_servico = 'coaching' then
      return round(p_quantidade * 60, 2);
    else
      return round(p_quantidade * 25, 2);
    end if;
  end if;

  return null;
end;
$$ language plpgsql immutable;

-- 3. Trigger: toda vez que um pedido é criado, o preço é substituído
--    pelo valor calculado aqui — o que o cliente mandou é ignorado.
--    Também força status/pagamento/booster para valores seguros,
--    mesmo que alguém tente inserir um pedido já como "pago".
create or replace function public.handle_pedido_insert()
returns trigger as $$
declare
  preco_calculado numeric;
begin
  preco_calculado := public.calcular_preco_pedido(
    NEW.servico, NEW.elo_atual, NEW.elo_desejado, NEW.quantidade
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
