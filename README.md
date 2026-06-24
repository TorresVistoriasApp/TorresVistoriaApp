# Torres Vistoria

Sistema SaaS de vistoria cautelar veicular — Fase 1 MVP.

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
| `npm run build` | Build de produção |
| `npm run test` | Testes unitários (Vitest) |
| `npm run test:e2e` | Testes E2E (Playwright) |
| `npm run db:types` | Gera tipos TypeScript do schema |
| `npm run scaffold` | Regenera arquivos scaffold |

## Estrutura

`src/app/` (rotas) · `src/components/` · `src/services/` · `src/hooks/` · `supabase/` (migrations e functions)

## Stack

React 19 · Vite 6 · Tailwind 4 · PostgreSQL · React Query · Zod · Zustand

## Variáveis de ambiente

Copie `.env.example` para `.env.local`. Nunca commite secrets.

| Variável | Uso |
|----------|-----|
| `VITE_API_URL` | URL do backend |
| `VITE_API_ANON_KEY` | Chave pública do cliente |
| `VITE_APP_URL` | URL pública do app (redirects de auth) |
| `VITE_DEMO_MODE` | `false` em produção |

Deploy e configuração de infraestrutura: [docs/DEPLOY.md](docs/DEPLOY.md).

## Documentação

| Doc | Conteúdo |
|-----|----------|
| [docs/CONVENCOES.md](docs/CONVENCOES.md) | Padrões de código, arquitetura e nomenclatura |
| [docs/SEGURANCA.md](docs/SEGURANCA.md) | RLS, headers, rate limit, checklist |
| [docs/LGPD.md](docs/LGPD.md) | Consentimento, exportação, exclusão |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Deploy, migrations e edge functions |

## Checklist Passo 6

- [x] Segurança: sanitização, rate limit, CSP, env validation
- [x] LGPD: banner, política, export/delete, RPC anonimização
- [x] Performance: lazy routes, code splitting, compressão fotos
- [x] Produção: headers HTTP, docs deploy
- [x] Validação pública de laudo: `/validar/:codigo`
