# Torres Vistoria

Sistema SaaS de vistoria cautelar veicular — Fase 1 MVP.

## Setup rápido

```bash
npm install
cp .env.example .env.local
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run test` | Testes unitários (Vitest) |
| `npm run test:e2e` | Testes E2E (Playwright) |
| `npm run db:types` | Gera tipos do Supabase |
| `npm run scaffold` | Regenera arquivos scaffold |

## Estrutura

`src/app/` (rotas) · `src/components/` · `src/services/` · `src/hooks/` · `supabase/`

## Stack

React 19 · Vite 6 · Tailwind 4 · Supabase · React Query · Zod · Zustand

## Deploy (Vercel)

1. Login: `npx vercel login`
2. Deploy produção: `npx vercel --prod`
3. Variáveis de ambiente no painel Vercel (ou CLI):

| Variável | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://ljzttzfjtskblxekmquu.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | chave anon do Supabase |
| `VITE_APP_NAME` | `Torres Vistoria` |
| `VITE_APP_URL` | URL do deploy Vercel |
| `VITE_DEMO_MODE` | `false` (produção) |

4. Supabase → Authentication → URL Configuration:
   - **Site URL:** URL da Vercel
   - **Redirect URLs:** `https://seu-app.vercel.app/**` e `/redefinir-senha`

Integração Git: conecte o repo `TorresVistoriaApp` em [vercel.com/new](https://vercel.com/new).

## Documentação

| Doc | Conteúdo |
|-----|----------|
| [docs/SEGURANCA.md](docs/SEGURANCA.md) | RLS, headers, rate limit, checklist |
| [docs/LGPD.md](docs/LGPD.md) | Consentimento, exportação, exclusão |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Vercel, Supabase, Edge Functions |

## Checklist Passo 6

- [x] Segurança: sanitização, rate limit, CSP, env validation
- [x] LGPD: banner, política, export/delete, RPC anonimização
- [x] Performance: lazy routes, code splitting, compressão fotos
- [x] Produção: vercel.json, docs deploy
- [x] Validação pública de laudo: `/validar/:codigo`
