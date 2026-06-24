# Segurança — Torres Vistoria

## Camadas implementadas

| Camada | Implementação |
|--------|----------------|
| **Autenticação** | JWT, refresh automático, sessão persistida |
| **Autorização** | RLS em 14 tabelas + RBAC no frontend (`ProtectedRoute`, `RequireRole`) |
| **Validação** | Zod em todos os formulários + sanitização (`src/lib/sanitize.ts`) |
| **Rate limit** | Login: 5 tentativas / 15 min (`src/lib/rate-limit.ts`) |
| **Headers HTTP** | CSP, HSTS, X-Frame-Options, nosniff (config de deploy) |
| **Edge Functions** | CORS restrito por origem (`getCorsHeaders`) |
| **Logs** | Logger com redação de PII em produção (`src/lib/logger.ts`) |
| **Integridade laudo** | SHA-256 + código público `/validar/:codigo` |

## Variáveis de ambiente

- Nunca commitar `.env.local`
- Produção: `VITE_DEMO_MODE=false`
- Validação em boot: `src/lib/env.ts`
- Secrets de servidor (`SERVICE_ROLE`, tokens) apenas em edge functions / CI

## Checklist pré-deploy

- [ ] RLS ativo em todas as tabelas
- [ ] `VITE_DEMO_MODE=false`
- [ ] Site URL e Redirect URLs configurados no auth do backend
- [ ] Edge Functions deployadas
- [ ] Migration LGPD aplicada (`anonymize_user_account`)
- [ ] Revisar advisors de segurança e performance do banco

## Responsabilidades

- **Frontend:** validação, UX segura, não expor chaves privilegiadas
- **Backend:** RLS, políticas, triggers de auditoria
- **Hospedagem:** headers, HTTPS, cache de assets
