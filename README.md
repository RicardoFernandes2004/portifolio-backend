# Portfolio Backend

API REST do meu portfólio pessoal, construída com **NestJS + Prisma + PostgreSQL**. Serve um blog (posts, categorias, comentários, likes e views), um currículo dinâmico (com geração de PDF on-demand) e uma área administrativa protegida por JWT.

O repositório foi pensado para que **qualquer dev possa cloná-lo e subir o próprio backend** — seja localmente, via Docker ou em provedores como Vercel/Fly.io.

## Stack

- [NestJS 11](https://nestjs.com/) (Express)
- [Prisma 7](https://www.prisma.io/) + PostgreSQL
- Autenticação JWT _stateful_ (token persistido e rotacionado a cada login)
- [Swagger / OpenAPI](https://swagger.io/) para documentação interativa
- `@nestjs/throttler` para rate limiting nos endpoints públicos de escrita
- `pdfmake` para geração de currículo em PDF

## Funcionalidades

- **Blog**: posts com slug, categorias, agendamento de publicação (draft vs publicado), imagens.
- **Engajamento**: comentários anônimos com respostas aninhadas (threads), likes e views — likes/views deduplicados por IP (hash); comentários com auto-moderação por blacklist de palavras.
- **Currículo**: header, experiências, formações, skills, idiomas e projetos, com exportação em PDF.
- **Admin**: CRUD protegido por JWT para todo o conteúdo.

## Estrutura do projeto

Arquitetura hexagonal (ports & adapters), um módulo por recurso:

```
src/
  <recurso>/
    domain/entity/        # entidades de domínio (regras + mapeamento Prisma -> DTO)
    service/              # casos de uso + DTOs e ports (interfaces)
    infra/repositories/   # implementação dos repositórios (Prisma)
    presentation/         # controllers (HTTP + Swagger)
prisma/
  schema.prisma           # modelos do banco
  migrations/             # migrações versionadas
  seed.ts                 # cria o usuário admin a partir das envs ADMIN_*
```

## Pré-requisitos

- **Node.js 22+** e npm
- **PostgreSQL** (local, Docker, ou um Postgres hospedado como Neon/Supabase)
- Opcional: **Docker + Docker Compose** (forma mais rápida de subir tudo)

## Começando (local)

### 1. Clonar e instalar

```bash
git clone <url-do-seu-fork> portifolio-backend
cd portifolio-backend
npm install
```

> O `postinstall` roda `prisma generate` automaticamente.

### 2. Configurar variáveis de ambiente

Copie o exemplo e preencha os valores:

```bash
cp .env.example .env
```

Defina pelo menos `DATABASE_URL`, `JWT_SECRET` e as credenciais `ADMIN_*` (veja a tabela abaixo).

### 3. Subir o banco

**Opção A — Docker (recomendado):**

```bash
docker compose up -d db
```

**Opção B — Postgres próprio:** ajuste a `DATABASE_URL` no `.env` apontando para a sua instância.

### 4. Aplicar as migrações

```bash
npx prisma migrate deploy   # aplica as migrações existentes
```

> Para desenvolvimento (criar novas migrações ao alterar o schema), use `npx prisma migrate dev`.

### 5. Criar o usuário admin

Com `ADMIN_USERNAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` definidos no `.env`:

```bash
npm run seed
```

O seed é idempotente: se o admin já existir, ele apenas avisa e não duplica.

### 6. Rodar a aplicação

```bash
npm run start:dev   # watch mode
# ou
npm run start       # modo normal
```

A API sobe em `http://localhost:${PORT}` (padrão `3001`).

- Swagger UI: `http://localhost:3001/docs`
- OpenAPI JSON: `http://localhost:3001/docs-json`

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | Sim | Connection string do PostgreSQL. Em serverless, prefira uma string _pooled_ (ex.: Neon com `?sslmode=require`). |
| `PORT` | Não | Porta HTTP (padrão `3000`; o `.env.example` usa `3001`). |
| `CORS_ORIGIN` | Não | Origens permitidas, separadas por vírgula. `*` ou vazio libera todas. |
| `JWT_SECRET` | Sim | Segredo usado para assinar os JWTs. |
| `JWT_EXPIRES_IN` | Não | Expiração do token (padrão `1d`). |
| `ADMIN_USERNAME` | Para o seed | Username do admin criado pelo `npm run seed`. |
| `ADMIN_EMAIL` | Para o seed | Email do admin. |
| `ADMIN_PASSWORD` | Para o seed | Senha em texto puro (é hasheada com bcrypt no seed). |
| `COMMENT_IP_SALT` | Recomendada | Salt para o hash de IP usado na dedup de likes/views. Defina um valor próprio em produção. |
| `COMMENT_BLACKLIST` | Não | Lista de palavras (CSV) que jogam o comentário para moderação (`PENDING`). Há uma lista padrão embutida. |

As variáveis `POSTGRES_*` no `.env.example` são usadas apenas pelo `docker-compose` para subir o banco local.

## Scripts disponíveis

| Script | Descrição |
| --- | --- |
| `npm run start:dev` | Inicia em watch mode |
| `npm run start` | Inicia a aplicação |
| `npm run build` | Build de produção (`dist/`) |
| `npm run start:prod` | Roda o build (`node dist/src/main.js`) |
| `npm run seed` | Build + cria o usuário admin a partir das envs `ADMIN_*` |
| `npm run prisma:migrate` | `prisma migrate dev` |
| `npm run prisma:generate` | Regenera o Prisma Client |
| `npm run lint` | ESLint com `--fix` |
| `npm run test` | Testes unitários (Jest) |
| `npm run test:e2e` | Testes e2e |
| `npm run test:cov` | Cobertura de testes |

## Autenticação

A área admin usa JWT _stateful_:

1. `POST /auth/login` com `{ "email" | "username", "password" }` retorna o usuário, o `token` (Bearer) e o `tokenExpiresAt`.
2. Envie o token no header `Authorization: Bearer <token>` nas rotas protegidas.
3. O token é **persistido** e **rotacionado** a cada login — logins novos revogam o token anterior.

No Swagger, clique em **Authorize** e cole o token para testar as rotas protegidas.

## Visão geral da API

Todas as rotas estão documentadas em `/docs`. Resumo dos recursos:

| Prefixo | Público | Admin (JWT) |
| --- | --- | --- |
| `/auth` | `POST /login` | — |
| `/posts` | listar publicados, detalhar por id/slug | criar, editar, publicar/despublicar, deletar |
| `/posts/:id/comments` | criar e listar comentários | — |
| `/posts/comments/...` | — | listar pendentes, aprovar, deletar |
| `/posts/:id/like` · `/posts/:id/view` | curtir/descurtir, registrar view | — |
| `/categories` | listar | CRUD |
| `/projects` `/skills` `/languages` `/experiences` `/educations` | listar | CRUD |
| `/resume` | header + PDF | atualizar header |

Os endpoints públicos de escrita (comentário, like, view) têm **rate limiting** por IP e podem retornar `429 Too Many Requests`.

## Rodando tudo com Docker

Sobe banco + backend juntos:

```bash
docker compose up --build
```

O serviço `backend` lê o `.env` e conecta no Postgres do compose. Após subir, rode o seed dentro do container (ou localmente apontando para o mesmo banco) para criar o admin.

## Deploy

O projeto está pronto para vários alvos:

- **Fly.io** — `fly.toml` já configurado; o `release_command` roda `prisma migrate deploy` a cada deploy. Porta interna `8080`.
- **Vercel** — `vercel.json` roteia tudo para `dist/src/main.js`. O script `build:vercel` faz `prisma generate && prisma migrate deploy && nest build`. Configure as mesmas variáveis de ambiente no painel do projeto.
- **Docker** — `Dockerfile` multi-stage (build + runtime enxuto), expõe `8080`. Use em qualquer plataforma de containers.

Em produção, use sempre um **Postgres hospedado** (Neon, Supabase, RDS, etc.) — nunca o `docker-compose` de desenvolvimento.

## Testes

```bash
npm run test       # unitários
npm run test:e2e   # end-to-end
npm run test:cov   # cobertura
```

## Contribuindo

Contribuições são bem-vindas! Veja o [guia de contribuição](CONTRIBUTING.md) para convenções de código, commits, migrações e o checklist de PR.

## Licença

Projeto sob licença [MIT](https://opensource.org/licenses/MIT). Sinta-se livre para usar como base do seu próprio portfólio.
