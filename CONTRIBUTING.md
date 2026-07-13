# Contribuindo

Obrigado pelo interesse em contribuir com o **Portfolio Backend**! Este guia reúne as convenções do projeto para que sua contribuição seja rápida de revisar e fácil de integrar.

Toda contribuição é bem-vinda: correção de bugs, novas features, testes, documentação ou melhorias de DX.

## Índice

- [Código de conduta](#código-de-conduta)
- [Como reportar bugs](#como-reportar-bugs)
- [Sugerindo features](#sugerindo-features)
- [Ambiente de desenvolvimento](#ambiente-de-desenvolvimento)
- [Arquitetura e organização do código](#arquitetura-e-organização-do-código)
- [Convenções de código](#convenções-de-código)
- [Banco de dados e migrações](#banco-de-dados-e-migrações)
- [Documentação da API (Swagger)](#documentação-da-api-swagger)
- [Testes](#testes)
- [Commits](#commits)
- [Branches](#branches)
- [Pull Requests](#pull-requests)

## Código de conduta

Seja respeitoso e colaborativo. Discussões técnicas são sempre sobre o código, nunca sobre a pessoa. Assédio ou comportamento tóxico não serão tolerados.

## Como reportar bugs

Abra uma _issue_ incluindo:

- Passos para reproduzir (de preferência com request/response ou payload).
- Comportamento esperado x comportamento observado.
- Ambiente relevante (versão do Node, sistema operacional, provedor de banco).
- Logs ou stack trace, se houver.

Antes de abrir, verifique se já não existe uma issue parecida.

## Sugerindo features

Abra uma issue descrevendo **o problema** que a feature resolve, não só a solução. Se a mudança for grande ou alterar o schema/contrato da API, prefira discutir na issue antes de abrir o PR.

## Ambiente de desenvolvimento

O passo a passo completo de setup (clonar, `.env`, subir o banco, migrações, seed e rodar) está no [README](README.md#começando-local). Resumo:

```bash
npm install
cp .env.example .env      # preencha DATABASE_URL, JWT_SECRET, ADMIN_*
docker compose up -d db   # ou aponte para o seu Postgres
npx prisma migrate deploy
npm run seed              # cria o usuário admin
npm run start:dev
```

Antes de abrir um PR, garanta que estes comandos passam:

```bash
npm run lint
npm run build
npm run test
```

## Arquitetura e organização do código

O projeto segue **arquitetura hexagonal (ports & adapters)**, com **um módulo por recurso** em `src/<recurso>/`:

| Camada | Pasta | Responsabilidade |
| --- | --- | --- |
| Domínio | `domain/entity/` | Entidades, regras de negócio e mapeamento Prisma → DTO |
| Aplicação | `service/` | Casos de uso, DTOs e _ports_ (interfaces em `service/dtos/*.ports.ts`) |
| Infraestrutura | `infra/repositories/` | Implementação dos repositórios com Prisma |
| Apresentação | `presentation/` | Controllers (HTTP + decorators do Swagger) |

Diretrizes:

- **Controllers** só lidam com HTTP: validam entrada, chamam o service e mapeiam para DTO de resposta. Sem regra de negócio.
- **Services** contêm a regra de negócio e dependem de _ports_ (interfaces), não de implementações concretas quando possível.
- **Repositories** são a única camada que fala com o Prisma.
- **Entidades** convertem o registro do Prisma em resposta via `toResponseDto()`; não exponha o modelo do Prisma direto na API.
- Ao criar um recurso novo, espelhe a estrutura de um módulo existente (ex.: `src/posts/`) e registre-o em [`src/app.module.ts`](src/app.module.ts).

## Convenções de código

- **TypeScript** em todo o projeto; evite `any`.
- **Prettier** formata o código: aspas simples e _trailing comma_ em tudo. Rode `npm run lint` (ESLint com `--fix`) antes de commitar.
- Use o **alias de path `src/`** nos imports (ex.: `import { PostsService } from 'src/posts/service/posts.service';`).
- **Nomes**: `PascalCase` para classes/DTOs/entidades, `camelCase` para variáveis e métodos, arquivos em `kebab-case` seguindo o sufixo da camada (`*.service.ts`, `*.controller.ts`, `*.repository.ts`, `*.dto.ts`, `*.ports.ts`).
- Não adicione comentários que só narram o óbvio; comente apenas intenção/trade-offs não evidentes.

## Banco de dados e migrações

- Alterações de schema vão em [`prisma/schema.prisma`](prisma/schema.prisma).
- Gere migrações com `npx prisma migrate dev --name <descrição-curta>` — **nunca** edite manualmente uma migração já aplicada/commitada.
- Convenções de schema (relações nos dois lados, `createdAt`/`updatedAt`, `@@index` em campos consultados, `@unique`/`@@unique` quando necessário) devem ser seguidas.
- Após alterar o schema, rode `npm run prisma:generate` e ajuste as camadas afetadas (ports, repository, entity, DTO).
- Sempre inclua o arquivo de migração gerado no commit.

## Documentação da API (Swagger)

A doc é gerada automaticamente pelos decorators do `@nestjs/swagger`. Todo endpoint novo **deve** vir documentado:

- `@ApiTags`, `@ApiOperation`, `@ApiParam`/`@ApiQuery`/`@ApiBody` conforme o caso.
- `@ApiOkResponse`/`@ApiCreatedResponse` e as respostas de erro relevantes (`@ApiBadRequestResponse`, `@ApiNotFoundResponse`, etc.).
- Rotas protegidas: `@UseGuards(JwtAuthGuard)` + `@ApiBearerAuth('access-token')`.
- DTOs com `@ApiProperty`/`@ApiPropertyOptional` em todos os campos.

Confira em `http://localhost:3001/docs` que sua rota aparece corretamente.

## Testes

- Testes unitários usam **Jest** e ficam ao lado do código como `*.spec.ts`.
- Cubra a regra de negócio no service e casos de borda relevantes.
- Rode `npm run test` (e `npm run test:e2e` quando mexer em fluxo HTTP) antes de abrir o PR.

## Commits

O projeto usa **[Conventional Commits](https://www.conventionalcommits.org/)**. Formato:

```
<tipo>: <descrição no imperativo>
```

Tipos mais usados: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`.

Exemplos (do próprio histórico):

```
feat: implement comments, likes, and views functionality for posts
chore: update .gitignore and enhance README with project details
fix: update vercel.json configuration for build and routing
```

Faça commits pequenos e coesos, cada um com uma mudança lógica.

## Branches

Crie branches a partir de `main` com nomes descritivos:

```
feat/comments-pagination
fix/like-dedup-ip
docs/contributing-guide
```

## Pull Requests

Antes de abrir, confirme:

- [ ] `npm run lint`, `npm run build` e `npm run test` passam localmente.
- [ ] Endpoints novos/alterados estão documentados no Swagger.
- [ ] Alterações de schema vêm com a migração gerada.
- [ ] A descrição do PR explica **o quê** e **por quê**, com passos de teste.
- [ ] O PR está focado num único objetivo (evite misturar refactor + feature + fix).

Vincule a issue relacionada (ex.: `Closes #123`) quando houver. Reviews podem pedir ajustes — faça _push_ de novos commits na mesma branch.

Obrigado por contribuir!
