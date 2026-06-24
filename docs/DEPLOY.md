# Deploy em Produção — Torres Vistoria

## Vercel (frontend)

```bash
npx vercel login
npx vercel --prod
```

### Variáveis obrigatórias

| Variável | Exemplo |
|----------|---------|
| `VITE_SUPABASE_URL` | `https://ljzttzfjtskblxekmquu.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | chave anon |
| `VITE_APP_NAME` | `Torres Vistoria` |
| `VITE_APP_URL` | `https://torres-vistoria-app.vercel.app` |
| `VITE_DEMO_MODE` | `false` |

### Configuração (`vercel.json`)

- Framework Vite, output `dist`
- SPA rewrite para `index.html`
- Security headers (CSP, HSTS, etc.)
- Cache longo para `/assets/*`

## Supabase

### Auth → URL Configuration

- **Site URL:** URL da Vercel
- **Redirect URLs:** `https://seu-app.vercel.app/**`, `/redefinir-senha`

### Migrations

```bash
supabase db push
# ou aplicar via Dashboard SQL
```

### Edge Functions

```bash
supabase functions deploy create-report
supabase functions deploy generate-pdf
supabase functions deploy compress-image
supabase functions deploy invite-user
```

Definir secrets: `SUPABASE_SERVICE_ROLE_KEY`, `SITE_URL`

## Performance

- Rotas lazy-loaded (`router.tsx`)
- Chunks: pdfmake, exceljs, charts, supabase, query
- PWA com service worker (cache estático)
- Fotos comprimidas WebP no cliente (max 1920px)
- `dns-prefetch` Supabase no `index.html`

## Pós-deploy

1. Testar login real (sem demo)
2. Fluxo vistoria → laudo → `/validar/:codigo`
3. Export LGPD e headers (securityheaders.com)
4. Playwright contra URL de produção (opcional)

## URL atual

Produção: https://torres-vistoria-app.vercel.app
