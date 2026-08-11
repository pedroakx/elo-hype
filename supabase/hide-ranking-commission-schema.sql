-- Rode este script no SQL Editor do Supabase DEPOIS do booster-profile-schema.sql
--
-- O ranking público não deve mais expor o percentual de comissão de
-- outros boosters — cada um só vê a própria % (já mostrada em "Seu
-- nível atual", que vem direto do profile logado, não desta função).

create or replace function public.get_ranking_boosters()
returns table(
  nome text,
  nivel integer,
  pedidos_concluidos integer,
  nickname text,
  avatar_url text
) as $$
  select p.nome, p.nivel, p.pedidos_concluidos, p.nickname, p.avatar_url
  from public.profiles p
  where p.role in ('booster', 'admin')
    and exists (
      select 1 from public.profiles me
      where me.id = auth.uid() and me.role in ('booster', 'admin')
    )
  order by p.pedidos_concluidos desc, p.nome asc;
$$ language sql security definer stable;
