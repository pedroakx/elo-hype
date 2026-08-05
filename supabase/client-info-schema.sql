-- Rode este script no SQL Editor do Supabase DEPOIS do staff-schema.sql
-- Ele libera o nome e e-mail do cliente para o booster que está com o pedido em mãos

-- 1. Adiciona coluna de e-mail no perfil (pra não precisar de permissão especial
--    pra ler a tabela auth.users, que é restrita)
alter table public.profiles
  add column if not exists email text;

-- 2. Garante que todo usuário já cadastrado tenha uma linha em profiles
--    (cobre quem se cadastrou antes de você rodar o staff-schema.sql)
insert into public.profiles (id, nome, email, role)
select id, raw_user_meta_data->>'nome', email, 'cliente'
from auth.users
where id not in (select id from public.profiles);

-- 3. Preenche o e-mail de quem já tinha perfil mas ainda sem e-mail salvo
update public.profiles
set email = auth.users.email
from auth.users
where public.profiles.id = auth.users.id
  and public.profiles.email is null;

-- 4. Atualiza a função de criação automática de perfil pra também salvar o e-mail
--    (assim, novos cadastros a partir de agora já vêm com e-mail preenchido)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, email, role)
  values (new.id, new.raw_user_meta_data->>'nome', new.email, 'cliente');
  return new;
end;
$$ language plpgsql security definer;

-- 5. Permite que o booster veja o perfil (nome/e-mail) do cliente
--    apenas nos pedidos que ele pode ver (pendente ou já assumido por ele)
create policy "Boosters veem perfil de clientes de pedidos visíveis"
  on public.profiles
  for select
  using (
    exists (
      select 1 from public.profiles me
      where me.id = auth.uid() and me.role in ('booster', 'admin')
    )
    and exists (
      select 1 from public.pedidos
      where pedidos.user_id = profiles.id
        and (pedidos.status = 'pendente' or pedidos.booster_id = auth.uid())
    )
  );

-- 6. Cria uma referência entre pedidos e profiles para permitir
--    buscar o pedido já trazendo o nome/e-mail do cliente numa única consulta
alter table public.pedidos
  add constraint pedidos_user_profile_fkey
  foreign key (user_id) references public.profiles(id)
  on delete cascade;
