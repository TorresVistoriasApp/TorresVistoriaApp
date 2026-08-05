# Refatoração Multi-Tenant — Torres Vistoria

Relatório consolidado da refatoração SaaS multi-tenant (Etapas 0–17).

## Resumo executivo

O **Torres Vistoria** foi refatorado para arquitetura **multi-tenant** com isolamento garantido por **Row Level Security (RLS)** no PostgreSQL/Supabase. O frontend injeta `company_id` automaticamente, mas **nunca confia apenas em filtros da UI** — toda regra crítica está no banco.

**Papéis ativos:** `SUPER_ADMIN` (visão da empresa) e `INSPECTOR` (apenas `created_by = auth.uid()`).

---

## Etapas concluídas

| Etapa | Conteúdo |
|-------|----------|
| **0** | Hotfix bypass cross-tenant em RPCs |
| **1** | Tabela `companies` (trade_name, plano, status) |
| **2** | Platform Admin + `platform_admins` |
| **3** | `profiles` com phone, status, auth_user_id |
| **4** | Enum `INSPECTOR` (substitui VISTORIADOR) |
| **5** | Audit columns em tabelas de negócio |
| **6** | RLS SUPER_ADMIN / INSPECTOR (`created_by`) |
| **7** | Storage — paths canônicos `{company_id}/{inspection_id}/...` |
| **8–10** | Auth, contextos, permissões, dashboard |
| **11** | Financeiro — admin vs inspector (`financial.read.own`) |
| **12** | Auditoria — LOGIN/LOGOUT/exportações, IP/UA |
| **13** | Migration legado + `legacy_storage_path_map` |
| **14** | Frontend — `company_id` automático (hooks/services) |
| **15** | Componentes tenant reutilizáveis |
| **16** | Testes de isolamento multi-tenant |
| **17** | Preparação SaaS futuro + qualidade |

---

## Arquivos criados (principais)

### Backend / Supabase
- `supabase/migrations/20260805120000_fix_cross_tenant_rpc_bypass.sql`
- `supabase/migrations/20260805121000_companies_tenant_profile.sql`
- `supabase/migrations/20260805122000_platform_admin_foundation.sql`
- `supabase/migrations/20260805130000_profiles_users_table_fields.sql`
- `supabase/migrations/20260805140000_tenant_role_enum_inspector.sql`
- `supabase/migrations/20260805150000_business_tables_audit_columns.sql`
- `supabase/migrations/20260805160000_rls_inspector_created_by_scope.sql`
- `supabase/migrations/20260805170000_storage_canonical_paths.sql`
- `supabase/migrations/20260805180000_financial_inspector_scope.sql`
- `supabase/migrations/20260805190000_audit_complete_events.sql`
- `supabase/migrations/20260805200000_legacy_data_migration.sql`
- `supabase/migrations/20260805210000_saas_future_foundation.sql`
- `supabase/tests/tenant_isolation.test.sql`
- `scripts/migrate-legacy-storage.mjs`

### Frontend
- `src/lib/tenant.ts`, `src/hooks/use-tenant-query.ts`
- `src/lib/tenant-isolation.ts`
- `src/lib/saas/` (planos, limites, integrações futuras)
- `src/hooks/use-plan-limits.ts`
- `src/components/tenant/` (RoleBadge, UserBadge, CompanyAvatar, etc.)
- `src/lib/company-display.ts`, `src/lib/cache-invalidation.ts`
- `src/lib/legacy-migration.ts`, `src/lib/audit-events.ts`

### Testes
- `tests/unit/lib/tenant-isolation.test.ts`
- `tests/integration/tenant-rls-contract.test.ts`
- `tests/unit/lib/saas/plan-limits.test.ts`

---

## Políticas RLS criadas / atualizadas

- **`can_access_tenant_row`** — empresa + `created_by` (SUPER_ADMIN vs INSPECTOR)
- **`can_access_financial_row`** — financeiro com escopo inspector
- **`can_access_inspection_row`** — fotos, checklist, comentários, laudos
- Políticas em: `inspections`, `inspection_photos`, `inspection_reports`, `financial_entries`, `profiles`, `audit_logs`, `settings`, `notifications`, Storage buckets
- Tabelas futuras (Etapa 17): `company_subscriptions`, `tenant_invitations`, `company_branches`, `company_teams`, `integration_connections`, `company_custom_permissions`

---

## Tabelas modificadas

`companies`, `profiles`, `inspections`, `inspection_photos`, `inspection_comments`, `inspection_reports`, `inspection_checklists`, `financial_entries`, `audit_logs`, `settings`, `notifications`, `inspection_types`, `legacy_storage_path_map`, `platform_admins`

---

## Melhorias realizadas

1. **Isolamento zero-trust** — RLS em todas as entidades de negócio
2. **RBAC centralizado** — `PermissionService`, guards, sem `if (role)` espalhado
3. **Contextos React** — Auth, User, Company, Permission, Inspection
4. **Storage canônico** — paths por `company_id`, triggers de validação
5. **Auditoria completa** — eventos de login, exportação, alterações
6. **Migração legado** — backfill sem perda de dados
7. **Componentes tenant** — badges, avatars, logos reutilizáveis
8. **Testes** — 130+ testes Vitest + pgTAP para isolamento
9. **Preparação SaaS** — catálogo de planos, limites, schema para billing/integrações

---

## Possíveis impactos

| Área | Impacto |
|------|---------|
| **Migrations pendentes** | Rodar `npx supabase db push --linked` no remoto |
| **INSPECTOR** | Vê apenas registros com `created_by` próprio |
| **Storage legado** | Executar `npm run db:migrate-legacy-storage` após push |
| **Tipos DB** | Rodar `npm run db:types` após aplicar migration 17 |
| **Planos SaaS** | Limites no frontend são informativos até billing ativo |

---

## Próximos passos recomendados

1. Aplicar todas as migrations no Supabase remoto
2. Executar script de migração de Storage legado
3. Rodar `npm run test:db` com Supabase local (Docker)
4. Integrar gateway de pagamento em `company_subscriptions`
5. Implementar fluxo de convite assíncrono (`tenant_invitations`)
6. Ativar feature flags por plano na UI (filiais, API pública)
7. Desenvolver integração Torres Consulta (B2C)
8. API pública documentada (OpenAPI) para ERP/CRM/Flutter

---

## Qualidade

- **TypeScript strict** habilitado (`tsconfig.app.json`)
- **Camadas:** services → hooks → components (feature folders)
- **Sem `any`** nos módulos novos
- **Testes:** `npm run test`, `npm run test:isolation`, `npm run test:db`
- **Build:** `npm run build`

---

*Documento gerado na Etapa 17 da refatoração multi-tenant.*
