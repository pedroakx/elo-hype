-- Rode este script no SQL Editor do Supabase DEPOIS do payment-schema.sql
-- Cria o sistema de nível/comissão e o ranking entre boosters

-- 1. Colunas de progresso no perfil do booster
alter table public.profiles
  add column if not exists pedidos_concluidos integer not null default 0,
  add column if not exists nivel integer not null default 1,
  add column if not exists percentual_comissao numeric(5,2) not null default 50.00;

-- 2. Colunas para registrar a comissão de cada pedido concluído
--    (guardadas no momento da conclusão, pra não mudar retroativamente
--    se o booster subir de nível depois)
alter table public.pedidos
  add column if not exists comissao_percentual numeric(5,2),
  add column if not exists comissao_valor numeric(10,2);

-- 3. Tabela de níveis: quantos pedidos concluídos são necessários
--    e qual o percentual de comissão de cada nível
create or replace function public.calcular_nivel(qtd integer)
returns table(nivel integer, percentual numeric) as $$
begin
  if qtd >= 220 then return query select 5, 70.00::numeric;
  elsif qtd >= 120 then return query select 4, 65.00::numeric;
  elsif qtd >= 60 then return query select 3, 60.00::numeric;
  elsif qtd >= 20 then return query select 2, 55.00::numeric;
  else return query select 1, 50.00::numeric;
  end if;
end;
$$ language plpgsql immutable;

-- 4. Sempre que um pedido passa a "concluido": soma +1 no contador do booster,
--    recalcula o nível dele e grava a comissão desse pedido específico
create or replace function public.handle_pedido_concluido()
returns trigger as $$
declare
  nova_qtd integer;
  info record;
  booster_role text;
begin
  if NEW.status = 'concluido'
     and (OLD.status is distinct from 'concluido')
     and NEW.booster_id is not null then

    select role into booster_role from public.profiles where id = NEW.booster_id;

    update public.profiles
    set pedidos_concluidos = pedidos_concluidos + 1
    where id = NEW.booster_id
    returning pedidos_concluidos into nova_qtd;

    select * into info from public.calcular_nivel(nova_qtd);

    -- Admin tem comissão fixa de 90%, não segue a progressão de nível dos boosters
    if booster_role = 'admin' then
      info.percentual := 90.00;
    end if;

    update public.profiles
    set nivel = info.nivel, percentual_comissao = info.percentual
    where id = NEW.booster_id;

    NEW.comissao_percentual := info.percentual;
    NEW.comissao_valor := round(NEW.preco * info.percentual / 100, 2);
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_pedido_concluido on public.pedidos;

create trigger on_pedido_concluido
  before update on public.pedidos
  for each row execute procedure public.handle_pedido_concluido();

-- 5. Função de ranking: qualquer booster/admin pode consultar o nome,
--    nível e pedidos concluídos de todos os boosters (sem expor e-mail
--    ou outros dados sensíveis, e sem depender de policy na tabela profiles)
create or replace function public.get_ranking_boosters()
returns table(
  nome text,
  nivel integer,
  pedidos_concluidos integer,
  percentual_comissao numeric
) as $$
  select p.nome, p.nivel, p.pedidos_concluidos, p.percentual_comissao
  from public.profiles p
  where p.role in ('booster', 'admin')
    and exists (
      select 1 from public.profiles me
      where me.id = auth.uid() and me.role in ('booster', 'admin')
    )
  order by p.pedidos_concluidos desc, p.nome asc;
$$ language sql security definer stable;

grant execute on function public.get_ranking_boosters() to authenticated;

-- 6. Recalcula o nível de todo mundo com os patamares atuais
--    (importante rodar de novo se você mudar os números do calcular_nivel
--    depois que alguns boosters já tiverem pedidos concluídos)
update public.profiles p
set nivel = c.nivel,
    percentual_comissao = case when p.role = 'admin' then 90.00 else c.percentual end
from lateral public.calcular_nivel(p.pedidos_concluidos) c
where p.role in ('booster', 'admin');
