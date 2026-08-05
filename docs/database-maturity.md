# Maturidade do banco (Ecossistema Torres)

Inventário vivo alinhado à revisão de arquitetura. Atualizar quando uma migration
mudar o status de qualquer item.

| Capacidade | Status | Evidência |
|------------|--------|-----------|
| Soft Delete | Parcial | `deleted_at` em tabelas de negócio; triggers em parte delas. Photos/reports ainda usam DELETE físico em fluxos de reenvio — retrofit universal fica fora até revisar esses fluxos (`20260806172000`). |
| Audit Trail | OK | `audit_logs` + triggers DML; ações de app (`LOGIN`, `EXPORT_*`). |
| Versionamento / Histórico | OK (via audit) | `get_entity_history(entity_type, entity_id)` reconstrói versões a partir de `old_data`/`new_data`. Sem coluna `version` otimista — deliberado para não duplicar o audit. |
| Multi Tenant | OK | Coluna `tenant_id` (rename de `company_id` em `20260806170000`). RLS usa `get_user_tenant_id()`. Tabela de entidade permanece `companies`. |
| Policies (RLS) | OK | Políticas por tabela; escopo inspector via `created_by` / helpers. |
| Permissions | OK | `permissions` + `role_permissions`; alinhadas ao frontend (`rbac-seed.test.ts`). Inclui códigos do Torres Consulta (`20260806160000`). |
| Indexes | OK | Índices tenant + FKs em `20260806172000` e migrations anteriores. |
| UUID | OK | PKs `UUID` com `gen_random_uuid()` / pgcrypto. |
| Triggers | OK | `updated_at`, soft-delete (parcial), audit, notificações. |
| Storage Policies | OK | Paths canônicos `{tenant_id}/...` + policies no bucket de fotos. |

## Lacunas conscientes (fora desta rodada)

1. Soft-delete trigger em `inspection_photos` / `inspection_reports`.
2. Tabela de versões paralela (rejeitada — `audit_logs` já cobre).
3. Resolução de tenant por hostname (frontend pronto; falta tabela de domínios).

## Migrations críticas de tenant

- `20260806170000_rename_company_id_to_tenant_id.sql`
- `20260806171000_rename_tenant_fk_constraints.sql`
- `20260806172000_tenant_hardening_and_history.sql`
