# Elo Hype

Site de venda de serviços de boost para League of Legends (Elo Boost, Duo Boost,
Coaching e Placement), com contas de cliente, painel de boosters, pagamento via
Mercado Pago e sistema de ranking/comissão entre boosters.

## Stack

React + Vite · React Router · Framer Motion · Supabase (Postgres, Auth, Edge Functions) · Mercado Pago

---

## 1. Configurar o Supabase

### 1.1 Rodar os scripts SQL

No painel do Supabase → **SQL Editor**, rode os arquivos de `supabase/*.sql`
**nesta ordem exata** (cada um depende do anterior):

1. `supabase/schema.sql` — tabela `pedidos`
2. `supabase/staff-schema.sql` — tabela `profiles`, papéis (cliente/booster/admin)
3. `supabase/client-info-schema.sql` — libera nome/e-mail do cliente pro booster
4. `supabase/payment-schema.sql` — colunas de pagamento
5. `supabase/ranking-schema.sql` — níveis, comissão e ranking dos boosters
6. `supabase/security-schema.sql` — move o cálculo de preço para o servidor
7. `supabase/chat-schema.sql` — chat entre cliente e booster
8. `supabase/booster-profile-schema.sql` — perfil do booster (nickname,
   Discord, nick do LoL, elo peak, foto)
9. `supabase/extras-schema.sql` — serviços extras (add-ons) no pedido
10. `supabase/fix-rls-recursion.sql` — corrige recursão infinita nas
    políticas de segurança de `profiles`
11. `supabase/pricing-v2-schema.sql` — tabela de preços por divisão + LP
    atual (substitui o cálculo antigo por tier inteiro)
12. `supabase/promo-schema.sql` — aplica a promoção de lançamento (50%
    OFF) também no valor cobrado de verdade, não só na tela
13. `supabase/hide-ranking-commission-schema.sql` — esconde a % de
    comissão de outros boosters no ranking público
14. `supabase/allow-profile-update-schema.sql` — libera o booster
    salvar o próprio perfil (nickname, Discord, nick do LoL, elo peak,
    foto) — sem isso, nada nessa tela era salvo

Todos são seguros pra rodar mais de uma vez (não duplicam dados).

### 1.2 Configurar autenticação por e-mail

**Authentication → Providers → Email**:
- Testando localmente: pode desativar "Confirm email" pra agilizar
- Em produção: mantenha ativado e configure um provedor SMTP em
  **Authentication → Settings** (o limite padrão do Supabase é bem baixo)

### 1.3 Criar as contas de equipe

Não existe cadastro público de booster/admin — por segurança, é sempre manual:

1. A pessoa se cadastra normalmente pelo site (vira `cliente`)
2. Você vai em **Table Editor → profiles**, acha a linha dela
3. Muda a coluna `role` para `booster` ou `admin`

---

## 2. Configurar o pagamento (Mercado Pago)

### 2.1 Pegar as credenciais

No [painel de desenvolvedores do Mercado Pago](https://www.mercadopago.com.br/developers/panel),
crie uma aplicação e copie o **Access Token** (use o de teste até validar tudo).

### 2.2 Instalar a CLI do Supabase e conectar ao projeto

```bash
npm install -g supabase
supabase login
supabase link --project-ref zayhejzdeepgtlophusu
```

### 2.3 Configurar os segredos das Edge Functions

```bash
supabase secrets set MP_ACCESS_TOKEN=seu_access_token_do_mercado_pago
supabase secrets set SITE_URL=http://localhost:5173
```

Troque `SITE_URL` pelo domínio real assim que publicar o site.

### 2.4 Deploy das Edge Functions

```bash
supabase functions deploy create-preference
supabase functions deploy mercado-pago-webhook --no-verify-jwt
```

### 2.5 Testar sem gastar dinheiro de verdade

Use os [cartões de teste do Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/test/cards)
pra simular pagamento aprovado, pendente e recusado.

---

## 3. Rodar o projeto localmente

O arquivo `.env` na raiz já deve ter:

```
VITE_SUPABASE_URL=https://zayhejzdeepgtlophusu.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

```bash
npm install
npm run dev
```

---

## 4. Testar o fluxo completo

**Cliente:** `/cadastro` → escolher um serviço → `/solicitar` → pagar → ver o
pedido em `/dashboard`

**Booster:** `/equipe/entrar` → ver o pedido pago em "Pedidos disponíveis" →
assumir → aparece em "Meus pedidos" → marcar como concluído → nível/comissão
atualiza automaticamente → conferir em `/equipe/ranking`

---

## 5. Como funcionam os preços

Tabela de preço por tier (`src/data/pricing.js`), pra Elo Boost:

| Tier | Preço do IV ao I |
|---|---|
| Ferro | R$ 40 |
| Bronze | R$ 45 |
| Prata | R$ 55 |
| Ouro | R$ 70 |
| Platina | R$ 100 |
| Esmeralda | R$ 190 |
| Diamante | R$ 310 |
| Diamante I → Mestre | R$ 140 |
| Mestre → Grão-Mestre | R$ 1.300 |
| Grão-Mestre → Desafiante | R$ 5.000 |

- **Duo Boost** = preço do Elo Boost + 65%
- **Coaching** = R$ 60 por sessão
- **Placement** = R$ 25 por partida

Pra mudar qualquer valor, edite `src/data/pricing.js`.

## 6. Como funciona o nível dos boosters

Nível sobe conforme o total de pedidos concluídos (acumulado):

| Nível | Pedidos concluídos | Comissão |
|---|---|---|
| 1 | 0 a 19 | 50% |
| 2 | 20 a 59 | 55% |
| 3 | 60 a 119 | 60% |
| 4 | 120 a 219 | 65% |
| 5 | 220+ | 70% |

**Admin tem comissão fixa de 90%**, independente do nível.

Pra mudar os patamares, edite a função `calcular_nivel` em
`supabase/ranking-schema.sql` e rode o script de novo no SQL Editor (ele
recalcula o nível de todo mundo automaticamente).

---

## 7. Pontos em aberto

- **Domínio de produção**: ao publicar, atualize `SITE_URL` no Supabase
  (passo 2.3) e o Access Token do Mercado Pago pra versão de produção (não
  a de teste).

## 8. Segurança

- **Preço à prova de manipulação**: o preço de cada pedido é recalculado
  no banco de dados (`security-schema.sql`), não confia no valor enviado
  pelo navegador.
- **RLS (Row Level Security)** ativado em `pedidos` e `profiles`: cada
  cliente só vê os próprios pedidos, cada booster só vê pedidos pendentes
  ou próprios, e ninguém consegue promover a própria conta a
  booster/admin pelo navegador (isso só é possível manualmente, pelo
  Table Editor do Supabase).
- **Webhook do Mercado Pago**: nunca confia no conteúdo da notificação
  recebida — sempre confirma o pagamento direto na API do Mercado Pago
  antes de liberar o pedido.
- **Headers de segurança HTTP** configurados em `vercel.json`
  (X-Frame-Options, HSTS, etc.), se você hospedar na Vercel.
- **Recomendado antes de lançar**: em Authentication → Policies no
  Supabase, configure o comprimento mínimo de senha pra 8 (o front-end já
  valida isso, mas o banco deveria exigir o mesmo, como segunda camada).
