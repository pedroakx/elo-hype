-- Rode este script no SQL Editor do Supabase DEPOIS do hide-ranking-commission-schema.sql
--
-- PROBLEMA: a tabela "profiles" nunca teve nenhuma política de UPDATE
-- para usuários comuns — só SELECT. Isso foi proposital (pra ninguém
-- conseguir virar admin/booster sozinho mudando a própria "role"), mas
-- também bloqueou edições legítimas, como o booster salvar nickname,
-- Discord, nick do LoL, elo peak e foto de perfil.
--
-- SOLUÇÃO: libera UPDATE na própria linha, mas restringe (a nível de
-- coluna, não só de linha) quais campos podem ser alterados. "role",
-- "nivel", "percentual_comissao" e "pedidos_concluidos" continuam
-- impossíveis de editar pelo próprio usuário, mesmo com a policy de
-- UPDATE liberada — porque a permissão de coluna nem existe pra eles.

create policy "Usuários atualizam o próprio perfil"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Garante que a permissão de UPDATE começa "zerada" antes de liberar
-- só as colunas específicas (evita liberar tudo sem querer)
revoke update on public.profiles from authenticated;

grant update (nickname, discord, nick_lol, elo_peak, avatar_url)
  on public.profiles
  to authenticated;
