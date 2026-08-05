-- Rode este script no SQL Editor do Supabase DEPOIS do security-schema.sql
-- Cria o chat entre cliente e booster, liberado só depois que o
-- booster assume o pedido (pedidos.booster_id preenchido)

create table if not exists public.mensagens (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  conteudo text not null check (char_length(trim(conteudo)) > 0),
  created_at timestamptz not null default now()
);

alter table public.mensagens enable row level security;

-- Só o cliente do pedido e o booster que assumiu podem ver as mensagens
create policy "Participantes do pedido veem as mensagens"
  on public.mensagens
  for select
  using (
    exists (
      select 1 from public.pedidos
      where pedidos.id = mensagens.pedido_id
        and (pedidos.user_id = auth.uid() or pedidos.booster_id = auth.uid())
    )
  );

-- Só pode enviar mensagem quem é cliente/booster do pedido, e só depois
-- que o pedido já tem um booster (ou seja, o booster já aceitou)
create policy "Participantes enviam mensagens após o pedido ser assumido"
  on public.mensagens
  for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.pedidos
      where pedidos.id = mensagens.pedido_id
        and pedidos.booster_id is not null
        and (pedidos.user_id = auth.uid() or pedidos.booster_id = auth.uid())
    )
  );

create index if not exists mensagens_pedido_id_idx on public.mensagens(pedido_id, created_at);

-- Habilita o Realtime nessa tabela, pra mensagens aparecerem na hora
-- sem precisar recarregar a página
alter publication supabase_realtime add table public.mensagens;
