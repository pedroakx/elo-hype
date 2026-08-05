-- Rode este script no SQL Editor do Supabase DEPOIS de já ter rodado o schema.sql
-- Ele cria o sistema de perfis (cliente/booster/admin) e as permissões do painel de funcionários

-- 1. Tabela de perfis, vinculada a cada usuário do Supabase Auth
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  role text not null default 'cliente' check (role in ('cliente', 'booster', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Usuários veem o próprio perfil"
  on public.profiles
  for select
  using (auth.uid() = id);

-- 2. Cria automaticamente um perfil "cliente" toda vez que alguém se cadastra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, role)
  values (new.id, new.raw_user_meta_data->>'nome', 'cliente');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Coluna para saber qual booster assumiu cada pedido
alter table public.pedidos
  add column if not exists booster_id uuid references auth.users(id);

-- 4. Boosters e admins podem ver pedidos pendentes (de qualquer cliente)
--    e os pedidos que eles mesmos já assumiram
create policy "Boosters veem pedidos pendentes ou próprios"
  on public.pedidos
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('booster', 'admin')
    )
    and (status = 'pendente' or booster_id = auth.uid())
  );

-- 5. Boosters e admins podem assumir/atualizar pedidos
create policy "Boosters podem assumir e atualizar pedidos"
  on public.pedidos
  for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('booster', 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('booster', 'admin')
    )
  );

-- ==========================================================================
-- IMPORTANTE: como criar uma conta de funcionário (booster)
--
-- 1. Peça para a pessoa se cadastrar normalmente pelo site (vira "cliente")
--    -- ou crie a conta direto em Authentication > Users no painel do Supabase.
-- 2. Vá em Table Editor > profiles, encontre a linha da pessoa (pelo e-mail
--    em Authentication > Users, copiando o UUID)
-- 3. Edite a coluna "role" dessa linha de "cliente" para "booster"
--
-- Não existe cadastro público de booster — isso é proposital, por segurança.
-- ==========================================================================
