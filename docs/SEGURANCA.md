# Segurança — Torres Vistoria

## Camadas implementadas

| Camada | Implementação |
|--------|----------------|
| **Autenticação** | Supabase Auth (JWT), refresh automático, sessão persistida |
| **Autorização** | RLS em 14 tabelas + RBAC no frontend (`ProtectedRoute`, `RequireRole`) |
| **Validação** | Zod em todos os formulários + sanitização (`src/lib/sanitize.ts`) |
| **Rate limit** | Login: 5 tentativas / 15 min (`src/lib/rate-limit.ts`) |
| **Headers HTTP** | CSP, HSTS, X-Frame-Options, nosniff (`vercel.json`) |
| **Edge Functions** | CORS restrito por origem (`getCorsHeaders`) |
| **Logs** | Logger com redação de PII em produção (`src/lib/logger.ts`) |
| **Integridade laudo** | SHA-256 + código público `/validar/:codigo` |

## Variáveis de ambiente

- Nunca commitar `.env.local`
- Produção: `VITE_DEMO_MODE=false`
- Validação em boot: `src/lib/env.ts`

## Checklist pré-deploy

- [ ] RLS ativo em todas as tabelas
- [ ] `VITE_DEMO_MODE=false` na Vercel
- [ ] Site URL e Redirect URLs no Supabase Auth
- [ ] Edge Functions deployadas (`create-report`, `invite-user`, etc.)
- [ ] Migration LGPD aplicada (`anonymize_user_account`)
- [ ] Revisar advisors Supabase (`security`, `performance`)

## Responsabilidades

- **Frontend:** validação, UX segura, não expor service_role
- **Supabase:** RLS, políticas, triggers de auditoria
- **Vercel:** headers, HTTPS, cache de assets
