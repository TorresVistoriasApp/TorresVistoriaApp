# Deploy em Produção — Torres Vistoria

## Frontend

Build estático (Vite). Hospede o conteúdo de `dist/` em qualquer CDN ou plataforma de SPA.

```bash
npm run build
```

### Variáveis obrigatórias

| Variável | Descrição |
|----------|-----------|
| `VITE_API_URL` | URL do backend |
| `VITE_API_ANON_KEY` | Chave pública do cliente |
| `VITE_APP_NAME` | Nome exibido no app |
| `VITE_APP_URL` | URL pública do frontend |
| `VITE_DEMO_MODE` | `false` em produção |

### Headers de segurança

O arquivo `vercel.json` na raiz define CSP, HSTS e cache. Para outras plataformas, replique os mesmos headers (ver seção `headers` do arquivo).

## Backend

### Auth → URL Configuration

- **Site URL:** URL pública do frontend
- **Redirect URLs:** URL do app + `/redefinir-senha`

### Migrations

```bash
supabase link --project-ref <DB_PROJECT_ID>
supabase db push
```

Defina `DB_PROJECT_ID` em `.env.local` para scripts locais (`npm run db:types`).

### Edge Functions

```bash
supabase functions deploy create-report
supabase functions deploy generate-pdf
supabase functions deploy compress-image
supabase functions deploy invite-user
```

Secrets do servidor (nunca expor no frontend):

| Secret | Uso |
|--------|-----|
| `SUPABASE_SERVICE_ROLE_KEY` | Operações privilegiadas nas functions |
| `SITE_URL` | Origem principal para CORS |
| `ALLOWED_ORIGINS` | Origens extras separadas por vírgula |

## Performance

- Rotas lazy-loaded (`router.tsx`)
- Chunks: pdfmake, exceljs, charts, api, query
- PWA com service worker (cache estático)
- Fotos comprimidas WebP no cliente (max 1920px)

## Pós-deploy

1. Testar login real (sem demo)
2. Fluxo vistoria → laudo → `/validar/:codigo`
3. Export LGPD e headers (securityheaders.com)
4. Playwright contra URL de produção (opcional)
