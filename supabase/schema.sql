-- Rode este script no SQL Editor do painel do Supabase
-- (Project > SQL Editor > New query)

create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  servico text not null check (servico in ('elo-boost', 'duo-boost', 'coaching', 'placement')),
  status text not null default 'pendente' check (status in ('pendente', 'em_andamento', 'concluido', 'cancelado')),
  elo_atual text,
  elo_desejado text,
  observacoes text,
  created_at timestamptz not null default now()
);

-- Ativa Row Level Security: cada usuário só acessa seus próprios pedidos
alter table public.pedidos enable row level security;

create policy "Usuários veem apenas seus próprios pedidos"
  on public.pedidos
  for select
  using (auth.uid() = user_id);

create policy "Usuários criam apenas seus próprios pedidos"
  on public.pedidos
  for insert
  with check (auth.uid() = user_id);

-- Índice para acelerar a consulta do dashboard
create index if not exists pedidos_user_id_idx on public.pedidos(user_id);
