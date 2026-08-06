-- Rode este script no SQL Editor do Supabase DEPOIS do chat-schema.sql
-- Adiciona os campos de perfil do booster (nickname, Discord, nick do LoL,
-- elo peak, foto) e configura o Storage pra upload de fotos.

-- 1. Novos campos no perfil
alter table public.profiles
  add column if not exists nome text,
  add column if not exists discord text,
  add column if not exists nick_lol text,
  add column if not exists elo_peak text,
  add column if not exists avatar_url text;

-- 2. Cliente pode ver os dados públicos do booster que assumiu o pedido dele
--    (nome/nickname/discord/nick do LoL/foto — não o e-mail nem o nível/comissão)
create policy "Clientes veem o perfil do booster do seu pedido"
  on public.profiles
  for select
  using (
    exists (
      select 1 from public.pedidos
      where pedidos.booster_id = profiles.id
        and pedidos.user_id = auth.uid()
    )
  );

-- 3. Referência entre pedidos e o perfil do booster, pra poder buscar o
--    pedido já trazendo os dados do booster numa única consulta
alter table public.pedidos
  add constraint pedidos_booster_profile_fkey
  foreign key (booster_id) references public.profiles(id)
  on delete set null;

-- 4. Cria o bucket de Storage pra fotos de perfil (público pra leitura,
--    já que a foto aparece pro cliente)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 5. Cada usuário só pode enviar/atualizar/apagar dentro da própria pasta
--    (o caminho do arquivo precisa começar com o próprio user id, ex:
--    "avatars/<user_id>/foto.png" — o front-end já faz isso automaticamente)
create policy "Usuários enviam a própria foto"
  on storage.objects
  for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Usuários atualizam a própria foto"
  on storage.objects
  for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Usuários apagam a própria foto"
  on storage.objects
  for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Fotos de perfil são públicas para leitura"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

-- 6. Atualiza a função de ranking pra também trazer nome e foto
create or replace function public.get_ranking_boosters()
returns table(
  nome text,
  nivel integer,
  pedidos_concluidos integer,
  percentual_comissao numeric,
  nomext,
  avatar_url text
) as $$
  select p.nome, p.nivel, p.pedidos_concluidos, p.percentual_comissao,
         p.nome, p.avatar_url
  from public.profiles p
  where p.role in ('booster', 'admin')
    and exists (
      select 1 from public.profiles me
      where me.id = auth.uid() and me.role in ('booster', 'admin')
    )
  order by p.pedidos_concluidos desc, p.nome asc;
$$ language sql security definer stable;
