-- Rode este script no SQL Editor do Supabase DEPOIS do client-info-schema.sql
-- Adiciona os campos necessários para o pagamento via Mercado Pago

alter table public.pedidos
  add column if not exists preco numeric(10,2),
  add column if not exists payment_status text not null default 'pendente'
    check (payment_status in ('pendente', 'pago', 'cancelado')),
  add column if not exists mp_preference_id text,
  add column if not exists mp_payment_id text;

-- O cliente pode criar o próprio pedido (necessário para o fluxo de pagamento,
-- que insere o pedido como "pendente" antes de redirecionar ao checkout)
drop policy if exists "Usuários criam apenas seus próprios pedidos" on public.pedidos;

create policy "Usuários criam apenas seus próprios pedidos"
  on public.pedidos
  for insert
  with check (auth.uid() = user_id);

-- Apenas o backend (service role, usado pela Edge Function do webhook)
-- pode confirmar pagamento — por isso não existe policy de update para o
-- próprio cliente. A service role ignora RLS por padrão.
