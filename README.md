# Torres App

SaaS de vistoria cautelar (Torres Vistoria) e consulta veicular (Torres Consulta).

## Setup rápido

```bash
npm install
cp .env.example .env.local
# Preencha VITE_API_URL e VITE_API_ANON_KEY
npm run dev
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Typecheck + build de produção |
| `npm run lint` | ESLint |
| `npm run lint:architecture` | Fronteiras entre camadas (`config` → `core` → `infra` → `shared` → `modules`) |
| `npm run typecheck` | TypeScript sem emitir arquivos |
| `npm run test` | Testes unitários e de integração (Vitest) |
| `npm run test:isolation` | Isolamento multi-tenant |
| `npm run test:db` | Testes pgTAP (Supabase local) |
| `npm run test:e2e` | Testes E2E (Playwright) |
| `npm run db:types` | Gera `src/infra/supabase/database.types.ts` a partir do schema |
| `npm run db:push` | Aplica migrations no banco remoto |

## Estrutura

```
src/
  app/          bootstrap da aplicação
  config/       env, rotas e constantes (não depende de ninguém)
  core/         regras de negócio compartilhadas (auth, tenant, rbac)
  infra/        adaptadores técnicos (Supabase, storage, cache)
  shared/       UI e utilitários sem regra de produto
  modules/      produtos: torres-vistoria, torres-consulta, admin
  layouts/      shells autenticados
  routes/       roteador e guards
tests/
  unit/         espelha as camadas de src/
  integration/  contratos (RLS, auth, storage)
  e2e/          Playwright
supabase/       migrations e Edge Functions
```

Um módulo só é consumido pelo barrel `@/modules/<nome>`. Importar arquivo interno de outro módulo é contrato acidental e falha no `lint:architecture`.

## Stack

React 19 · Vite 6 · Tailwind 4 · PostgreSQL (Supabase) · React Query · Zod · Zustand

## Variáveis de ambiente

Copie `.env.example` para `.env.local`. Nunca commite secrets.

| Variável | Uso |
|----------|-----|
| `VITE_API_URL` | URL pública da API |
| `VITE_API_ANON_KEY` | Chave pública do cliente |
| `VITE_APP_URL` | URL pública do app (redirects de auth) |
| `VITE_DEMO_MODE` | `false` em produção |
