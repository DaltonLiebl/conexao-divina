# Conexão Divina

*Seu encontro diário com Deus.* Aplicativo cristão premium (PWA) feito com Next.js e Supabase.

Arquitetura, decisões e plano de etapas: **[ARQUITETURA.md](./ARQUITETURA.md)**.

## Rodar localmente

Requisitos: Node.js 20 ou mais recente.

```bash
npm install
cp .env.example .env.local   # preencha as variáveis do Supabase
npm run dev                  # http://localhost:3000
```

Páginas úteis durante o desenvolvimento:

- `/design-system`: todos os componentes, cores, paisagens e estados, com troca de tema e de tamanho da letra.

## Scripts

| Comando             | O que faz                                                        |
| ------------------- | ---------------------------------------------------------------- |
| `npm run dev`       | servidor de desenvolvimento                                      |
| `npm run build`     | build de produção                                                |
| `npm run lint`      | ESLint                                                           |
| `npm run typecheck` | checagem de tipos                                                |
| `npm run test:db`   | aplica as migrações num PostgreSQL embutido e testa RLS e regras |
| `npm run icons`     | gera os ícones do app em `public/icons`                          |

## Banco de dados (Supabase)

1. **Somente na primeira vez, no projeto compartilhado:** rode
   `supabase/shared-project/0000_isolar_apps_pessoais.sql` no SQL editor.
2. Rode as migrações de `supabase/migrations/` em ordem (SQL editor → colar → Run).
3. Em **Project Settings → Data API → Exposed schemas**, adicione `conexao`.
4. Em **Authentication → Sign In / Providers**, ligue o cadastro por e-mail e a **confirmação de e-mail**.
   Para produção, configure um SMTP próprio.
5. Em **Authentication → URL Configuration**, adicione `https://SEU-DOMINIO/**` às Redirect URLs.
6. Depois de criar sua conta no app, torne-se administrador (SQL em ARQUITETURA.md).

## Publicação (Vercel)

1. Crie o projeto na Vercel apontando para este diretório.
2. Cadastre as variáveis do `.env.example`. As que não começam com `NEXT_PUBLIC_` são secretas e ficam
   só no servidor.
3. Faça o deploy e acesse pelo celular: no Android, use o menu → "Instalar app"; no iPhone, use
   Compartilhar → "Adicionar à Tela de Início".
