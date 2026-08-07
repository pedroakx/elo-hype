-- Rode este script no SQL Editor do Supabase AGORA — corrige um bug crítico
-- que está causando erro 500 em qualquer consulta que envolva "profiles"
-- (incluindo o cadastro de novas contas).
--
-- CAUSA: a política "Boosters veem perfil de clientes de pedidos visíveis"
-- consulta a própria tabela "profiles" de dentro da política que protege
-- a tabela "profiles" — isso faz o Postgres entrar em loop infinito.
--
-- SOLUÇÃO: mover essa checagem de cargo (role) para uma função com
-- privilégio elevado (security definer), que consulta a tabela sem
-- disparar a política de novo.

create or replace function public.is_staff(uid uuid)
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role in ('booster', 'admin')
  );
$$ language sql security definer stable;

drop policy if exists "Boosters veem perfil de clientes de pedidos visíveis" on public.profiles;

create policy "Boosters veem perfil de clientes de pedidos visíveis"
  on public.profiles
  for select
  using (
    public.is_staff(auth.uid())
    and exists (
      select 1 from public.pedidos
      where pedidos.user_id = profiles.id
        and (pedidos.status = 'pendente' or pedidos.booster_id = auth.uid())
    )
  );
