# Conexão Divina: arquitetura e plano

> Leia este arquivo antes de continuar o desenvolvimento. Ele registra as decisões, o estado de cada etapa
> e o que depende de credenciais externas.

## Visão geral

Aplicativo cristão premium (PWA) em português: palavra e versículo do dia, "Como está seu coração",
orações, Bíblia, jornadas, diário privado, pedidos de oração, assistente de IA (Guia da Fé), Momento de Paz,
progresso, notificações, plano gratuito e premium, e um painel administrativo.

| Camada        | Tecnologia                                                                 |
| ------------- | -------------------------------------------------------------------------- |
| Front + API   | Next.js 16 (App Router, Turbopack), React 19, TypeScript                   |
| UI            | Tailwind CSS v4, shadcn/ui (estilo base-nova = Base UI), Lucide, Motion     |
| Dados / Auth  | Supabase (PostgreSQL + Auth + Storage), schema **`conexao`**                |
| Hospedagem    | Vercel (funções serverless para webhooks, IA, cron e push)                  |
| App           | PWA instalável (manifest + service worker), mobile-first                   |

### Estrutura de pastas

```
src/
  app/                    rotas (App Router)
    design-system/        vitrine interna dos componentes (noindex)
    manifest.ts, robots.ts, sitemap.ts, icon.svg
  components/
    ui/                   shadcn (ajustados à marca: botões ≥ 48px, cantos amplos)
    ds/                   componentes do design system (estados, cards, títulos, animação)
    brand/                logotipo e paisagens SVG
    appearance/           tema, tamanho da letra, reduzir animações
  lib/                    utilitários (brand, appearance, utils)
supabase/
  migrations/             SQL versionado (aplicar em ordem no SQL editor)
  tests/db.test.mjs       testes de RLS/regras em PGlite (npm run test:db)
  shared-project/         ajustes no projeto Supabase compartilhado (ver abaixo)
scripts/generate-icons.mjs  gera os ícones PWA a partir do símbolo
```

## Decisões

1. **Projeto Supabase compartilhado.** Por escolha do dono, o app usa o schema `conexao` dentro do projeto
   `crm-entregas` (ref `lzrspcqyqeveivwoioxm`), onde também estão o CRM, o Financeiro e o StudyHub.
   Consequências:
   - `auth.users` é compartilhado. Um usuário só "existe" no app quando tem linha em `conexao.profiles`,
     criada por `conexao.ensure_profile()` no primeiro acesso (não por gatilho em `auth.users`).
   - **Antes de abrir o cadastro**, aplicar `supabase/shared-project/0000_isolar_apps_pessoais.sql`. Sem isso,
     cada cliente ganharia linhas vazias nos apps pessoais.
   - O cadastro público está desligado nesse projeto e precisará ser religado, junto com a
     **confirmação de e-mail**, que é obrigatória porque a vinculação de compras por e-mail depende dela.
   - Um cliente conseguiria entrar nos apps pessoais com o mesmo login, mas veria tudo vazio, porque a RLS
     é por usuário. Para bloquear isso de vez, uma etapa futura pode incluir uma lista de e-mails permitidos
     nos apps pessoais.
   - A `service_role` key dá acesso a todos os apps do projeto. Ela fica só nas variáveis de servidor da Vercel.
   - Migrar para um projeto próprio no futuro é simples: as migrações deste repositório recriam tudo.
2. **Next.js com `cacheComponents` desligado.** Quase todas as telas dependem da sessão (cookies). O modelo
   tradicional (dinâmico + cache explícito) é mais simples e previsível.
3. **Privacidade por construção.** Diário, pedidos de oração, check-ins de sentimento, anotações bíblicas e
   conversas com a IA **não têm política de leitura para administradores**. O painel vê apenas agregados,
   através de funções `SECURITY DEFINER` (`admin_metrics`, `admin_list_users`).
4. **Premium no banco, não só na tela.** A RLS impede ler o corpo de conteúdo premium sem assinatura ativa
   (`has_premium()`). As views `*_catalog` listam itens premium com selo de cadeado, sem o texto.
   `daily_word_for()` devolve a palavra premium com o corpo vazio e `locked = true`.
5. **Recursos gratuitos configuráveis.** `app_settings['access.free_features']` define o que é gratuito.
   `has_feature('journal')` etc. usam essa lista. O diário de gratidão é sempre liberado.
6. **Conteúdo diário automático.** `daily_word_for(data)` / `daily_verse_for(data)` usam o conteúdo agendado
   para a data. Sem agendamento, escolhem um do "rodízio" de forma determinística (todos veem o mesmo no dia).
   Datas futuras só ficam visíveis para a equipe. O fuso é `America/Sao_Paulo` (`app_today()`).
7. **Compras antes do cadastro.** Webhooks gravam a assinatura com `customer_email`. `ensure_profile()`
   vincula ao usuário **somente se o e-mail estiver confirmado**.
8. **Bíblia.** Bíblia Livre (BLIVRE), licença CC BY 4.0 Brasil, com crédito exibido no app. Almeida ARA/NVI/NTLH/ACF
   são protegidas e exigem licença das editoras.
9. **Imagens.** As capas padrão são paisagens SVG próprias (`components/brand/scene.tsx`), sem licença de
   terceiros. Fotos enviadas pelo painel (Storage) as substituem. A tabela `media_assets` guarda crédito
   e licença de cada arquivo.
10. **Acessibilidade.** Base de 17px, controle de tamanho de letra (0,9× a 1,5×) que escala o app inteiro
    (tudo em rem), botões de pelo menos 48px, foco visível, contraste AA (variantes `-ink` para texto
    dourado/verde), opção "reduzir animações" e respeito a `prefers-reduced-motion`.

## Banco de dados (migração 0001)

Tabelas principais do schema `conexao`:

- **Conta:** `profiles` (papel user/editor/admin, bloqueio), `preferences` (onboarding, tema, letra, horário)
- **Monetização:** `plans`, `subscriptions` (kiwify/hotmart/cakto/stripe/manual), `payments`, `webhook_events` (idempotência)
- **Conteúdo:** `daily_words`, `daily_verses`, `prayers`, `categories`, `feelings`, `journeys`, `journey_days`,
  `audios`, `media_assets`, `banners`, `app_settings`, `notifications`
- **Bíblia:** `bible_translations`, `bible_books` (66 livros já cadastrados), `bible_verses` (busca full-text em português)
- **Dados pessoais (RLS só do dono):** `favorites`, `bible_highlights`, `bible_notes`, `bible_reading_log`,
  `journal_entries` (+ view `gratitude_entries`), `prayer_requests` (status e testemunho), `mood_checkins`,
  `user_journeys`, `journey_day_completions`, `activity_log`, `user_goals`, `user_achievements`, `reminders`,
  `push_subscriptions`, `ai_conversations`, `ai_messages`
- **Auditoria:** `admin_audit_log`

RPCs: `ensure_profile`, `log_activity`, `my_stats`, `daily_word_for`, `daily_verse_for`, `has_premium`,
`has_feature`, `admin_metrics`, `admin_list_users`, `admin_set_access`, `admin_set_role`,
`admin_grant_premium`, `admin_revoke_subscription`.

Testes: `npm run test:db` roda 58 verificações (RLS entre usuários, anônimo, premium, rodízio, admin sem
acesso a dados privados, exclusão em cascata).

**Primeiro administrador**, depois de criar a conta no app:

```sql
update conexao.profiles set role = 'admin'
where id = (select id from auth.users where email = 'SEU_EMAIL');
```

## Etapas

> 24/11/2026: a pedido do dono, as telas do app vieram antes da autenticação. O app já funciona sem login:
> conteúdo inicial em `src/content/` e dados do usuário (nome, favoritos, destaques, última leitura,
> progresso de jornadas) no localStorage do aparelho (`src/lib/local-store.ts`). Na etapa de login esses dados
> passam a ser sincronizados com as tabelas já criadas na migração 0001.

| #  | Etapa                                                                        | Estado        |
| -- | ---------------------------------------------------------------------------- | ------------- |
| 1  | Arquitetura, banco de dados (RLS + testes), design system, PWA manifest, ícones | **Concluída** |
| 1b | App navegável: Início, Palavra do dia, Versículo do dia, dias anteriores, Como está seu coração, Orações (15 categorias), Bíblia completa (leitor, destaques, busca, continuar leitura), Jornadas (2 × 7 dias), Favoritos, Perfil (nome, letra, tema, instalar) | **Concluída** |
| 2  | Autenticação (e-mail/senha, Google, recuperação, verificação), onboarding completo, sincronizar dados locais com o banco | Próxima |
| 3  | Gerador de imagens de versículos, Diário, Pedidos de oração, Progresso e conquistas | |
| 4  | Momento de Paz (áudio), Guia da Fé (IA)                                      | |
| 5  | Notificações push e lembretes (service worker, VAPID, cron)                  | |
| 6  | Painel administrativo (conteúdo, calendário editorial, usuários, métricas)   | |
| 7  | Monetização (planos, página premium, webhooks Kiwify/Hotmart/Cakto/Stripe)   | |
| 8  | Privacidade, termos, SEO final, testes e publicação                          | |

### Conteúdo e Bíblia

- **Bíblia Livre (BLIVRE)**, CC BY 4.0 Brasil, baixada de eBible.org. Ver `data/biblia/blivre/LEIA-ME.md`.
  O texto não é alterado. `scripts/build-bible.mjs` converte o VPL em um JSON por livro.
- O conteúdo (`src/content/`) só guarda **referências**. O texto do versículo é sempre lido da Bíblia.
  `npm run check:content` confere se todas as referências existem.
- O rodízio diário (`src/lib/daily.ts`) usa a data de Brasília: todos veem o mesmo conteúdo no mesmo dia.
- O botão Ouvir usa a voz do próprio aparelho (Web Speech API, sem custo). Áudios gravados entram na etapa 4.

## Serviços externos que precisam de configuração (não simulados)

| Serviço                    | Para quê                                  | O que é preciso                                         |
| -------------------------- | ----------------------------------------- | ------------------------------------------------------- |
| Supabase                   | banco, login, arquivos                    | aplicar migrações, expor schema `conexao` na Data API, religar cadastro + confirmação de e-mail |
| SMTP próprio (ex.: Resend) | e-mails de confirmação/recuperação        | o SMTP padrão do Supabase envia pouquíssimos e-mails por hora |
| Google Cloud (OAuth)       | "Entrar com Google"                       | Client ID/Secret configurados no Supabase               |
| Texto bíblico              | leitor e busca                            | tradução com licença comercial (ver Decisão 8)          |
| Áudios / músicas           | Momento de Paz, orações narradas          | arquivos próprios ou com licença comercial              |
| Anthropic API              | Guia da Fé                                | `ANTHROPIC_API_KEY` (custo por uso)                     |
| VAPID                      | notificações push                         | par de chaves gerado e salvo na Vercel                  |
| Kiwify/Hotmart/Cakto/Stripe| pagamentos                                | conta, produto/oferta e segredo do webhook              |
| Vercel                     | hospedagem e cron                         | projeto + variáveis de ambiente                         |
