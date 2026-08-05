/**
 * Codemod da migração para arquitetura modular (Fases 2 e 3).
 *
 * Move arquivos e reescreve os specifiers `@/...` em src/ e tests/.
 * Suporta três operações:
 *   - MOVES: renomeia um módulo inteiro (1 arquivo -> 1 arquivo).
 *   - ALIASES: reescreve specifiers de barrel/diretório sem mover arquivo.
 *   - SPLITS: reescreve por símbolo, dividindo um import em vários destinos.
 *
 * Execução única e destrutiva: rode com a árvore de trabalho limpa.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");
const SCAN_DIRS = [SRC, path.join(ROOT, "tests")];
const CODE_EXT = new Set([".ts", ".tsx"]);

/** @type {[string, string][]} pares [origem, destino] relativos a src/. */
const MOVES = [
  // ── config ────────────────────────────────────────────────────────────────
  ["lib/env.ts", "config/env.ts"],

  // ── core/rbac ─────────────────────────────────────────────────────────────
  ["lib/rbac.ts", "core/rbac/permissions.ts"],
  ["lib/role-labels.ts", "core/rbac/role-labels.ts"],
  ["services/permission-service.ts", "core/rbac/permission-service.ts"],
  ["app/permission-context.tsx", "core/rbac/permission-context.tsx"],
  ["hooks/use-permission.ts", "core/rbac/use-permission.ts"],
  ["components/shared/permission-guard.tsx", "core/rbac/components/permission-guard.tsx"],
  ["components/shared/role-guard.tsx", "core/rbac/components/role-guard.tsx"],
  ["app/require-role.tsx", "core/rbac/components/require-permission.tsx"],

  // ── core/auth ─────────────────────────────────────────────────────────────
  ["app/session-context.tsx", "core/auth/session-context.tsx"],
  ["app/auth-context.tsx", "core/auth/auth-context.tsx"],
  ["app/user-context.tsx", "core/auth/user-context.tsx"],
  ["services/auth-service.ts", "core/auth/auth-service.ts"],
  ["services/platform-admin-service.ts", "core/auth/platform-admin-service.ts"],
  ["hooks/use-auth.ts", "core/auth/use-auth.ts"],
  ["hooks/use-session.ts", "core/auth/use-session.ts"],
  ["lib/ensure-session.ts", "core/auth/ensure-session.ts"],
  ["lib/password-policy.ts", "core/auth/password-policy.ts"],
  ["lib/rate-limit.ts", "core/auth/rate-limit.ts"],
  ["stores/auth-store.ts", "core/auth/auth-store.ts"],
  ["schemas/auth.ts", "core/auth/schemas/auth.ts"],
  ["components/auth/login-showcase.tsx", "core/auth/components/login-showcase.tsx"],
  ["app/(auth)/login/page.tsx", "core/auth/pages/login-page.tsx"],
  ["app/(auth)/recuperar-senha/page.tsx", "core/auth/pages/forgot-password-page.tsx"],
  ["app/(auth)/redefinir-senha/page.tsx", "core/auth/pages/reset-password-page.tsx"],
  ["app/(auth)/trocar-senha/page.tsx", "core/auth/pages/change-password-page.tsx"],

  // ── core/tenant ───────────────────────────────────────────────────────────
  ["lib/tenant.ts", "core/tenant/tenant.ts"],
  ["lib/tenant-isolation.ts", "core/tenant/tenant-isolation.ts"],
  ["lib/company-display.ts", "core/tenant/company-display.ts"],
  ["hooks/use-tenant-boot.ts", "core/tenant/use-tenant-boot.ts"],
  ["hooks/use-tenant-query.ts", "core/tenant/use-tenant-query.ts"],
  ["app/company-context.tsx", "core/tenant/company-context.tsx"],
  ["services/company-service.ts", "core/tenant/company-service.ts"],
  ["hooks/use-company.ts", "core/tenant/use-company.ts"],
  ["schemas/settings.ts", "core/tenant/schemas/company.ts"],
  ["components/tenant/company-avatar.tsx", "core/tenant/components/company-avatar.tsx"],
  ["components/tenant/company-badge.tsx", "core/tenant/components/company-badge.tsx"],
  ["components/tenant/company-logo.tsx", "core/tenant/components/company-logo.tsx"],
  ["components/tenant/role-badge.tsx", "core/tenant/components/role-badge.tsx"],
  ["components/tenant/user-badge.tsx", "core/tenant/components/user-badge.tsx"],

  // ── core/errors + observability ───────────────────────────────────────────
  ["lib/errors.ts", "core/errors/app-error.ts"],
  ["lib/user-facing-errors.ts", "core/errors/user-facing-errors.ts"],
  ["components/shared/error-boundary.tsx", "core/errors/error-boundary.tsx"],
  ["lib/logger.ts", "core/observability/logger.ts"],

  // ── core/audit ────────────────────────────────────────────────────────────
  ["lib/audit-events.ts", "core/audit/audit-events.ts"],
  ["lib/audit-utils.ts", "core/audit/audit-utils.ts"],
  ["services/audit-service.ts", "core/audit/audit-service.ts"],

  // ── core/subscription + integrações ───────────────────────────────────────
  ["lib/saas/types.ts", "core/subscription/types.ts"],
  ["lib/saas/plan-catalog.ts", "core/subscription/plan-catalog.ts"],
  ["lib/saas/plan-limit-service.ts", "core/subscription/plan-limit-service.ts"],
  ["lib/saas/index.ts", "core/subscription/index.ts"],
  ["hooks/use-plan-limits.ts", "core/subscription/use-plan-limits.ts"],
  ["lib/saas/integration-types.ts", "core/integrations/integration-types.ts"],

  // ── core/compliance (LGPD) ────────────────────────────────────────────────
  ["lib/lgpd.ts", "core/compliance/lgpd.ts"],
  ["services/lgpd-service.ts", "core/compliance/lgpd-service.ts"],
  ["hooks/use-lgpd.ts", "core/compliance/use-lgpd.ts"],
  ["hooks/use-lgpd-consent.ts", "core/compliance/use-lgpd-consent.ts"],
  ["components/shared/lgpd-consent-banner.tsx", "core/compliance/components/lgpd-consent-banner.tsx"],
  ["app/(public)/privacidade/page.tsx", "core/compliance/pages/privacy-page.tsx"],

  // ── infra ─────────────────────────────────────────────────────────────────
  ["lib/db-client.ts", "infra/supabase/client.ts"],
  ["lib/queries.ts", "infra/supabase/queries.ts"],
  ["lib/mutations.ts", "infra/supabase/mutations.ts"],
  ["types/database.ts", "infra/supabase/database.types.ts"],
  ["lib/storage-buckets.ts", "infra/storage/buckets.ts"],
  ["lib/storage-paths.ts", "infra/storage/paths.ts"],
  ["lib/storage-url.ts", "infra/storage/signed-url.ts"],
  ["lib/query-client.ts", "infra/query/query-client.ts"],
  ["lib/cache-invalidation.ts", "infra/query/cache-invalidation.ts"],

  // ── shared/ui ─────────────────────────────────────────────────────────────
  ["components/ui/button.tsx", "shared/ui/button.tsx"],
  ["components/ui/card.tsx", "shared/ui/card.tsx"],
  ["components/ui/dialog.tsx", "shared/ui/dialog.tsx"],
  ["components/ui/dropdown-menu.tsx", "shared/ui/dropdown-menu.tsx"],
  ["components/ui/input.tsx", "shared/ui/input.tsx"],
  ["components/ui/label.tsx", "shared/ui/label.tsx"],
  ["components/ui/loading-screen.tsx", "shared/ui/loading-screen.tsx"],
  ["components/ui/masked-input.tsx", "shared/ui/masked-input.tsx"],
  ["components/ui/tabs.tsx", "shared/ui/tabs.tsx"],

  // ── shared/components ─────────────────────────────────────────────────────
  ["components/shared/brand-logo.tsx", "shared/components/brand-logo.tsx"],
  ["components/shared/brand-mark.tsx", "shared/components/brand-mark.tsx"],
  ["components/shared/confirm-dialog.tsx", "shared/components/confirm-dialog.tsx"],
  ["components/shared/data-table.tsx", "shared/components/data-table.tsx"],
  ["components/shared/empty-state.tsx", "shared/components/empty-state.tsx"],
  ["components/shared/export-button.tsx", "shared/components/export-button.tsx"],
  ["components/shared/loading-spinner.tsx", "shared/components/loading-spinner.tsx"],
  ["components/shared/mobile-back-button.tsx", "shared/components/mobile-back-button.tsx"],
  ["components/shared/page-header.tsx", "shared/components/page-header.tsx"],
  ["components/shared/password-strength-input.tsx", "shared/components/password-strength-input.tsx"],
  ["components/shared/search-input.tsx", "shared/components/search-input.tsx"],
  ["components/shared/toast-viewport.tsx", "shared/components/toast-viewport.tsx"],
  ["components/shared/user-avatar.tsx", "shared/components/user-avatar.tsx"],
  ["components/forms/form-field.tsx", "shared/components/forms/form-field.tsx"],
  ["components/forms/form-field-group.tsx", "shared/components/forms/form-field-group.tsx"],
  ["components/forms/form-section-card.tsx", "shared/components/forms/form-section-card.tsx"],
  ["components/forms/year-select-field.tsx", "shared/components/forms/year-select-field.tsx"],
  ["components/forms/masked-fields.tsx", "shared/components/forms/masked-fields.tsx"],
  ["components/charts/chart-wrapper.tsx", "shared/components/charts/chart-wrapper.tsx"],
  ["components/charts/chart-responsive-container.tsx", "shared/components/charts/chart-responsive-container.tsx"],
  ["components/charts/kpi-card.tsx", "shared/components/charts/kpi-card.tsx"],
  ["components/charts/monthly-chart-navigation.tsx", "shared/components/charts/monthly-chart-navigation.tsx"],
  ["components/dashboard/stats-grid.tsx", "shared/components/charts/stats-grid.tsx"],

  // ── shared/hooks + stores + lib + types ───────────────────────────────────
  ["hooks/use-mobile.ts", "shared/hooks/use-mobile.ts"],
  ["hooks/use-local-storage.ts", "shared/hooks/use-local-storage.ts"],
  ["hooks/use-toast.ts", "shared/hooks/use-toast.ts"],
  ["hooks/use-svg-gradient.ts", "shared/hooks/use-svg-gradient.ts"],
  ["stores/ui-store.ts", "shared/stores/ui-store.ts"],
  ["lib/utils.ts", "shared/lib/utils.ts"],
  ["lib/formatters.ts", "shared/lib/formatters.ts"],
  ["lib/masks.ts", "shared/lib/masks.ts"],
  ["lib/validation.ts", "shared/lib/validation.ts"],
  ["lib/sanitize.ts", "shared/lib/sanitize.ts"],
  ["lib/field-na.ts", "shared/lib/field-na.ts"],
  ["lib/form-styles.ts", "shared/lib/form-styles.ts"],
  ["lib/chart-theme.ts", "shared/lib/chart-theme.ts"],
  ["lib/cep.ts", "shared/lib/cep.ts"],
  ["lib/brazilian-ufs.ts", "shared/lib/brazilian-ufs.ts"],
  ["lib/export-csv.ts", "shared/lib/export-csv.ts"],
  ["lib/export-excel.ts", "shared/lib/export-excel.ts"],
  ["lib/export-pdf.ts", "shared/lib/export-pdf.ts"],
  ["lib/compress-image.ts", "shared/lib/compress-image.ts"],
  ["lib/pick-image-files.ts", "shared/lib/pick-image-files.ts"],
  ["lib/optimize-pdf.ts", "shared/lib/optimize-pdf.ts"],
  ["lib/pdf-embed-image.ts", "shared/lib/pdf-embed-image.ts"],
  ["lib/chunk-load-recovery.ts", "shared/lib/chunk-load-recovery.ts"],
  ["lib/public-images.ts", "shared/lib/public-images.ts"],
  ["types/index.ts", "shared/types/index.ts"],

  // ── layouts ───────────────────────────────────────────────────────────────
  ["app/layout.tsx", "layouts/root-layout.tsx"],
  ["app/(auth)/layout.tsx", "layouts/auth-layout.tsx"],
  ["app/(public)/layout.tsx", "layouts/public-layout.tsx"],
  ["app/(dashboard)/layout.tsx", "layouts/client-layout.tsx"],
  ["app/(admin)/layout.tsx", "layouts/admin-layout.tsx"],
  ["components/layout/app-shell.tsx", "layouts/components/app-shell.tsx"],
  ["components/layout/header.tsx", "layouts/components/header.tsx"],
  ["components/layout/footer.tsx", "layouts/components/footer.tsx"],
  ["components/layout/sidebar.tsx", "layouts/components/sidebar.tsx"],
  ["components/layout/sidebar-nav.tsx", "layouts/components/sidebar-nav.tsx"],
  ["components/layout/sidebar-profile.tsx", "layouts/components/sidebar-profile.tsx"],
  ["components/layout/sidebar-collapse-toggle.tsx", "layouts/components/sidebar-collapse-toggle.tsx"],
  ["components/layout/mobile-nav.tsx", "layouts/components/mobile-nav.tsx"],
  ["components/layout/mobile-drawer.tsx", "layouts/components/mobile-drawer.tsx"],
  ["components/layout/notification-bell.tsx", "layouts/components/notification-bell.tsx"],

  // ── routes + providers ────────────────────────────────────────────────────
  ["lib/nav-items.ts", "routes/navigation.ts"],
  ["components/shared/protected-route.tsx", "routes/guards/protected-route.tsx"],
  ["components/shared/platform-admin-route.tsx", "routes/guards/platform-admin-route.tsx"],
  ["components/shared/require-password-changed.tsx", "routes/guards/require-password-changed.tsx"],
  ["app/providers.tsx", "providers/app-providers.tsx"],

  // ── modules/torres-vistoria :: domínio ────────────────────────────────────
  ["lib/checklist-catalog.ts", "modules/torres-vistoria/domain/checklist/checklist-catalog.ts"],
  ["lib/checklist-status.ts", "modules/torres-vistoria/domain/checklist/checklist-status.ts"],
  ["lib/paint-catalog.ts", "modules/torres-vistoria/domain/paint-catalog.ts"],
  ["lib/vehicle-brands.ts", "modules/torres-vistoria/domain/vehicle-brands.ts"],
  ["lib/vehicle-brand-logos.ts", "modules/torres-vistoria/domain/vehicle-brand-logos.ts"],
  ["lib/inspection-opinion-labels.ts", "modules/torres-vistoria/domain/inspection-opinion-labels.ts"],
  ["lib/legacy-migration.ts", "modules/torres-vistoria/domain/legacy-migration.ts"],
  ["lib/vistoria-form-defaults.ts", "modules/torres-vistoria/domain/vistoria-form-defaults.ts"],

  // ── modules/torres-vistoria :: serviços, hooks, schemas, tipos ────────────
  ["services/inspection-service.ts", "modules/torres-vistoria/services/inspection-service.ts"],
  ["services/checklist-service.ts", "modules/torres-vistoria/services/checklist-service.ts"],
  ["services/photo-service.ts", "modules/torres-vistoria/services/photo-service.ts"],
  ["services/pdf-service.ts", "modules/torres-vistoria/services/pdf-service.ts"],
  ["services/financial-service.ts", "modules/torres-vistoria/services/financial-service.ts"],
  ["services/report-service.ts", "modules/torres-vistoria/services/dashboard-service.ts"],
  ["services/notification-service.ts", "modules/torres-vistoria/services/notification-service.ts"],
  ["services/inspection-type-service.ts", "modules/torres-vistoria/services/inspection-type-service.ts"],
  ["hooks/use-inspections.ts", "modules/torres-vistoria/hooks/use-inspections.ts"],
  ["hooks/use-inspection.ts", "modules/torres-vistoria/hooks/use-inspection.ts"],
  ["hooks/use-inspection-detail.ts", "modules/torres-vistoria/hooks/use-inspection-detail.ts"],
  ["hooks/use-inspection-context.ts", "modules/torres-vistoria/hooks/use-inspection-context.ts"],
  ["hooks/use-inspection-types.ts", "modules/torres-vistoria/hooks/use-inspection-types.ts"],
  ["hooks/use-checklist.ts", "modules/torres-vistoria/hooks/use-checklist.ts"],
  ["hooks/use-photos.ts", "modules/torres-vistoria/hooks/use-photos.ts"],
  ["hooks/use-photo-capture-flow.ts", "modules/torres-vistoria/hooks/use-photo-capture-flow.ts"],
  ["hooks/use-dashboard.ts", "modules/torres-vistoria/hooks/use-dashboard.ts"],
  ["hooks/use-dashboard-scope.ts", "modules/torres-vistoria/hooks/use-dashboard-scope.ts"],
  ["hooks/use-financial.ts", "modules/torres-vistoria/hooks/use-financial.ts"],
  ["hooks/use-financial-scope.ts", "modules/torres-vistoria/hooks/use-financial-scope.ts"],
  ["hooks/use-notifications.ts", "modules/torres-vistoria/hooks/use-notifications.ts"],
  ["app/inspection-context.tsx", "modules/torres-vistoria/context/inspection-context.tsx"],
  ["schemas/vistoria.ts", "modules/torres-vistoria/schemas/vistoria.ts"],
  ["schemas/cliente.ts", "modules/torres-vistoria/schemas/cliente.ts"],
  ["schemas/veiculo.ts", "modules/torres-vistoria/schemas/veiculo.ts"],
  ["schemas/checklist.ts", "modules/torres-vistoria/schemas/checklist.ts"],
  ["schemas/photo.ts", "modules/torres-vistoria/schemas/photo.ts"],
  ["schemas/financial.ts", "modules/torres-vistoria/schemas/financial.ts"],
  ["schemas/inspection-type.ts", "modules/torres-vistoria/schemas/inspection-type.ts"],
  ["types/api.ts", "modules/torres-vistoria/types/api.ts"],

  // ── modules/torres-vistoria :: componentes ────────────────────────────────
  ["components/vistoria/avaliacao-tecnica-panel.tsx", "modules/torres-vistoria/components/vistoria/avaliacao-tecnica-panel.tsx"],
  ["components/vistoria/evaluation-section.tsx", "modules/torres-vistoria/components/vistoria/evaluation-section.tsx"],
  ["components/vistoria/inspection-wizard-shell.tsx", "modules/torres-vistoria/components/vistoria/inspection-wizard-shell.tsx"],
  ["components/vistoria/inspection-wizard-stepper.tsx", "modules/torres-vistoria/components/vistoria/inspection-wizard-stepper.tsx"],
  ["components/vistoria/vistoria-actions-menu.tsx", "modules/torres-vistoria/components/vistoria/vistoria-actions-menu.tsx"],
  ["components/vistoria/vistoria-card.tsx", "modules/torres-vistoria/components/vistoria/vistoria-card.tsx"],
  ["components/vistoria/vistoria-filters.tsx", "modules/torres-vistoria/components/vistoria/vistoria-filters.tsx"],
  ["components/vistoria/vistoria-list.tsx", "modules/torres-vistoria/components/vistoria/vistoria-list.tsx"],
  ["components/vistoria/vistoria-status-badge.tsx", "modules/torres-vistoria/components/vistoria/vistoria-status-badge.tsx"],
  ["components/checklist/checklist-category.tsx", "modules/torres-vistoria/components/checklist/checklist-category.tsx"],
  ["components/checklist/checklist-item.tsx", "modules/torres-vistoria/components/checklist/checklist-item.tsx"],
  ["components/checklist/checklist-status-toggle.tsx", "modules/torres-vistoria/components/checklist/checklist-status-toggle.tsx"],
  ["components/checklist/checklist-summary.tsx", "modules/torres-vistoria/components/checklist/checklist-summary.tsx"],
  ["components/checklist/compact-checklist-form.tsx", "modules/torres-vistoria/components/checklist/compact-checklist-form.tsx"],
  ["components/checklist/compact-checklist-item.tsx", "modules/torres-vistoria/components/checklist/compact-checklist-item.tsx"],
  ["components/laudo/laudo-readiness.tsx", "modules/torres-vistoria/components/laudo/laudo-readiness.tsx"],
  ["components/laudo/laudo-review-panel.tsx", "modules/torres-vistoria/components/laudo/laudo-review-panel.tsx"],
  ["components/laudo/laudo-review-sections.tsx", "modules/torres-vistoria/components/laudo/laudo-review-sections.tsx"],
  ["components/pdf/laudo-template.tsx", "modules/torres-vistoria/components/pdf/laudo-template.tsx"],
  ["components/pdf/mercosul-plate.tsx", "modules/torres-vistoria/components/pdf/mercosul-plate.tsx"],
  ["components/pdf/pdf-download-button.tsx", "modules/torres-vistoria/components/pdf/pdf-download-button.tsx"],
  ["components/pdf/pdf-preview.tsx", "modules/torres-vistoria/components/pdf/pdf-preview.tsx"],
  ["components/reports/reports-results.tsx", "modules/torres-vistoria/components/reports/reports-results.tsx"],
  ["components/reports/reports-summary.tsx", "modules/torres-vistoria/components/reports/reports-summary.tsx"],
  ["components/dashboard/dashboard-admin-shortcuts.tsx", "modules/torres-vistoria/components/dashboard/dashboard-admin-shortcuts.tsx"],
  ["components/dashboard/dashboard-scope-banner.tsx", "modules/torres-vistoria/components/dashboard/dashboard-scope-banner.tsx"],
  ["components/dashboard/monthly-overview.tsx", "modules/torres-vistoria/components/dashboard/monthly-overview.tsx"],
  ["components/dashboard/recent-inspections.tsx", "modules/torres-vistoria/components/dashboard/recent-inspections.tsx"],
  ["components/financial/financial-scope-banner.tsx", "modules/torres-vistoria/components/financial/financial-scope-banner.tsx"],
  ["components/charts/inspections-chart.tsx", "modules/torres-vistoria/components/charts/inspections-chart.tsx"],
  ["components/charts/inspections-pie-chart.tsx", "modules/torres-vistoria/components/charts/inspections-pie-chart.tsx"],
  ["components/charts/revenue-chart.tsx", "modules/torres-vistoria/components/charts/revenue-chart.tsx"],
  ["components/forms/checklist-form.tsx", "modules/torres-vistoria/components/forms/checklist-form.tsx"],
  ["components/forms/cliente-form.tsx", "modules/torres-vistoria/components/forms/cliente-form.tsx"],
  ["components/forms/veiculo-form.tsx", "modules/torres-vistoria/components/forms/veiculo-form.tsx"],
  ["components/forms/vistoria-form.tsx", "modules/torres-vistoria/components/forms/vistoria-form.tsx"],
  ["components/forms/financial-entry-form.tsx", "modules/torres-vistoria/components/forms/financial-entry-form.tsx"],
  ["components/forms/optional-label.tsx", "modules/torres-vistoria/components/forms/optional-label.tsx"],
  ["components/forms/parecer-tecnico-fields.tsx", "modules/torres-vistoria/components/forms/parecer-tecnico-fields.tsx"],
  ["components/forms/parecer-tecnico-section.tsx", "modules/torres-vistoria/components/forms/parecer-tecnico-section.tsx"],
  ["components/forms/plate-lookup-hint.tsx", "modules/torres-vistoria/components/forms/plate-lookup-hint.tsx"],

  // ── modules/torres-vistoria :: páginas e layout ───────────────────────────
  ["app/(dashboard)/page.tsx", "modules/torres-vistoria/pages/dashboard-page.tsx"],
  ["app/(dashboard)/vistorias/page.tsx", "modules/torres-vistoria/pages/inspections-page.tsx"],
  ["app/(dashboard)/vistorias/nova/page.tsx", "modules/torres-vistoria/pages/inspection-new-page.tsx"],
  ["app/(dashboard)/vistorias/[id]/page.tsx", "modules/torres-vistoria/pages/inspection-detail-page.tsx"],
  ["app/(dashboard)/vistorias/[id]/editar/page.tsx", "modules/torres-vistoria/pages/inspection-edit-page.tsx"],
  ["app/(dashboard)/vistorias/[id]/fotos/page.tsx", "modules/torres-vistoria/pages/inspection-photos-page.tsx"],
  ["app/(dashboard)/vistorias/[id]/checklist/page.tsx", "modules/torres-vistoria/pages/inspection-checklist-page.tsx"],
  ["app/(dashboard)/vistorias/[id]/laudo/page.tsx", "modules/torres-vistoria/pages/inspection-report-page.tsx"],
  ["app/(dashboard)/financeiro/page.tsx", "modules/torres-vistoria/pages/financial-page.tsx"],
  ["app/(dashboard)/financeiro/receitas/page.tsx", "modules/torres-vistoria/pages/financial-revenue-page.tsx"],
  ["app/(dashboard)/financeiro/despesas/page.tsx", "modules/torres-vistoria/pages/financial-expenses-page.tsx"],
  ["app/(dashboard)/relatorios/page.tsx", "modules/torres-vistoria/pages/reports-page.tsx"],
  ["app/(public)/validar/[codigo]/page.tsx", "modules/torres-vistoria/pages/validate-report-page.tsx"],
  ["app/(dashboard)/vistorias/inspection-layout.tsx", "modules/torres-vistoria/layouts/inspection-layout.tsx"],

  // ── modules/admin :: usuários ─────────────────────────────────────────────
  ["features/users/components/create-user-dialog.tsx", "modules/admin/users/components/create-user-dialog.tsx"],
  ["features/users/components/edit-user-dialog.tsx", "modules/admin/users/components/edit-user-dialog.tsx"],
  ["features/users/components/user-card.tsx", "modules/admin/users/components/user-card.tsx"],
  ["features/users/hooks/use-admin-users.ts", "modules/admin/users/hooks/use-admin-users.ts"],
  ["features/users/pages/users-page.tsx", "modules/admin/users/pages/users-page.tsx"],
  ["features/users/schemas/user-admin.ts", "modules/admin/users/schemas/user-admin.ts"],
  ["features/users/services/admin-users-service.ts", "modules/admin/users/services/admin-users-service.ts"],
  ["features/users/index.ts", "modules/admin/users/index.ts"],
  ["services/user-service.ts", "modules/admin/users/services/user-service.ts"],
  ["hooks/use-user.ts", "modules/admin/users/hooks/use-user.ts"],
  ["hooks/use-users.ts", "modules/admin/users/hooks/use-users.ts"],
  ["schemas/user.ts", "modules/admin/users/schemas/user.ts"],

  // ── modules/admin :: auditoria ────────────────────────────────────────────
  ["features/audit/components/audit-action-badge.tsx", "modules/admin/audit/components/audit-action-badge.tsx"],
  ["features/audit/components/audit-detail-dialog.tsx", "modules/admin/audit/components/audit-detail-dialog.tsx"],
  ["features/audit/components/audit-filters.tsx", "modules/admin/audit/components/audit-filters.tsx"],
  ["features/audit/pages/audit-page.tsx", "modules/admin/audit/pages/audit-page.tsx"],
  ["hooks/use-audit.ts", "modules/admin/audit/hooks/use-audit.ts"],

  // ── modules/admin :: configurações ────────────────────────────────────────
  ["features/settings/components/change-password-section.tsx", "modules/admin/settings/components/change-password-section.tsx"],
  ["features/settings/components/company-address-fields.tsx", "modules/admin/settings/components/company-address-fields.tsx"],
  ["features/settings/components/inspection-types-section.tsx", "modules/admin/settings/components/inspection-types-section.tsx"],
  ["features/settings/components/privacy-rights-section.tsx", "modules/admin/settings/components/privacy-rights-section.tsx"],
  ["features/settings/components/settings-section.tsx", "modules/admin/settings/components/settings-section.tsx"],
  ["features/settings/index.ts", "modules/admin/settings/index.ts"],
  ["app/(dashboard)/configuracoes/page.tsx", "modules/admin/settings/pages/settings-page.tsx"],
  ["app/(dashboard)/configuracoes/empresa/page.tsx", "modules/admin/settings/pages/company-settings-page.tsx"],
  ["app/(dashboard)/configuracoes/perfil/page.tsx", "modules/admin/settings/pages/profile-settings-page.tsx"],

  // ── modules/admin :: operação da plataforma (SaaS) ────────────────────────
  ["features/platform-admin/components/onboard-company-dialog.tsx", "modules/admin/platform/components/onboard-company-dialog.tsx"],
  ["features/platform-admin/pages/admin-companies-page.tsx", "modules/admin/platform/pages/admin-companies-page.tsx"],
  ["services/platform-company-service.ts", "modules/admin/platform/services/platform-company-service.ts"],
  ["hooks/use-platform-admin.ts", "modules/admin/platform/hooks/use-platform-admin.ts"],
  ["schemas/platform-admin.ts", "modules/admin/platform/schemas/platform-admin.ts"],

  // ── modules/torres-vistoria :: subsistema de rascunho offline ─────────────
  ["features/draft/components/draft-auto-save-banner.tsx", "modules/torres-vistoria/draft/components/draft-auto-save-banner.tsx"],
  ["features/draft/components/draft-recovery-modal.tsx", "modules/torres-vistoria/draft/components/draft-recovery-modal.tsx"],
  ["features/draft/components/draft-system-provider.tsx", "modules/torres-vistoria/draft/components/draft-system-provider.tsx"],
  ["features/draft/components/photo-action-sheet.tsx", "modules/torres-vistoria/draft/components/photo-action-sheet.tsx"],
  ["features/draft/components/sync-status-indicator.tsx", "modules/torres-vistoria/draft/components/sync-status-indicator.tsx"],
  ["features/draft/hooks/use-auto-save-inspection.ts", "modules/torres-vistoria/draft/hooks/use-auto-save-inspection.ts"],
  ["features/draft/hooks/use-draft-recovery.ts", "modules/torres-vistoria/draft/hooks/use-draft-recovery.ts"],
  ["features/draft/hooks/use-network-status.ts", "modules/torres-vistoria/draft/hooks/use-network-status.ts"],
  ["features/draft/hooks/use-offline-sync.ts", "modules/torres-vistoria/draft/hooks/use-offline-sync.ts"],
  ["features/draft/lib/completion-percent.ts", "modules/torres-vistoria/draft/lib/completion-percent.ts"],
  ["features/draft/lib/constants.ts", "modules/torres-vistoria/draft/lib/constants.ts"],
  ["features/draft/lib/draft-defaults.ts", "modules/torres-vistoria/draft/lib/draft-defaults.ts"],
  ["features/draft/lib/offline-store.ts", "modules/torres-vistoria/draft/lib/offline-store.ts"],
  ["features/draft/lib/sync-logger.ts", "modules/torres-vistoria/draft/lib/sync-logger.ts"],
  ["features/draft/lib/sync-queue.ts", "modules/torres-vistoria/draft/lib/sync-queue.ts"],
  ["features/draft/services/draft-service.ts", "modules/torres-vistoria/draft/services/draft-service.ts"],
  ["features/draft/stores/sync-store.ts", "modules/torres-vistoria/draft/stores/sync-store.ts"],
  ["features/draft/types.ts", "modules/torres-vistoria/draft/types.ts"],
  ["features/draft/index.ts", "modules/torres-vistoria/draft/index.ts"],
];

// Subárvores que migram preservando a estrutura interna.
const TREE_MOVES = [
  ["lib/photos", "modules/torres-vistoria/domain/photos"],
  ["lib/laudo", "modules/torres-vistoria/domain/laudo"],
  ["components/photos", "modules/torres-vistoria/components/photos"],
];

/** Arquivos removidos: código morto, barrels substituídos ou módulos divididos. */
const DELETES = [
  "lib/constants.ts",
  "lib/enums.ts",
  "lib/types.ts",
  "stores/inspection-store.ts",
  "schemas/index.ts",
  "app/routes.tsx",
  "app/contexts/index.ts",
  "components/tenant/index.ts",
  "app/(dashboard)/usuarios/page.tsx",
  "app/(dashboard)/auditoria/page.tsx",
  "app/(admin)/empresas/page.tsx",
  "app/page.tsx",
  "app/router.tsx",
  "schemas/.gitkeep",
  "services/.gitkeep",
  "stores/.gitkeep",
];

/** Specifiers de barrel/diretório que não correspondem a um arquivo movido 1:1. */
const ALIASES = {
  "@/lib/photos": "@/modules/torres-vistoria/domain/photos",
  "@/lib/saas": "@/core/subscription",
  "@/types": "@/shared/types",
  "@/features/draft": "@/modules/torres-vistoria/draft",
  "@/features/users": "@/modules/admin/users",
  "@/features/settings": "@/modules/admin/settings",
  "@/components/tenant": "@/core/tenant/components",
  "@/app/router": "@/routes/router",
  "@/app/routes": "@/routes/router",
};

/** Reescrita por símbolo: quebra dependências de configuração para domínio. */
const SPLITS = {
  "@/lib/enums": {
    UserRole: "@/core/rbac/roles",
    FutureUserRole: "@/core/rbac/roles",
    TenantRoleCode: "@/core/rbac/roles",
    UserStatus: "@/core/rbac/roles",
    InspectionSituation: "@/modules/torres-vistoria/domain/enums",
    InspectionPurpose: "@/modules/torres-vistoria/domain/enums",
    InspectionOpinion: "@/modules/torres-vistoria/domain/enums",
    InspectionStatus: "@/modules/torres-vistoria/domain/enums",
    ChecklistStatus: "@/modules/torres-vistoria/domain/enums",
    FinancialEntryType: "@/modules/torres-vistoria/domain/enums",
  },
  "@/lib/constants": {
    APP_NAME: "@/config/app",
    APP_VERSION: "@/config/app",
    DEFAULT_PRIMARY_COLOR: "@/config/app",
    DEFAULT_COMPANY_ID: "@/config/app",
    ROUTE_SLUGS: "@/config/routes",
    ROUTES: "@/config/routes",
    ROUTE_PATTERNS: "@/config/routes",
    NEW_INSPECTION_FLOW_QUERY: "@/config/routes",
    withNewInspectionFlow: "@/config/routes",
    CHECKLIST_CATEGORIES: "@/modules/torres-vistoria/domain/checklist/checklist-catalog",
    PHOTO_CATEGORIES: "@/modules/torres-vistoria/domain/photos/photo-catalog",
  },
};

// ─────────────────────────────────────────────────────────────────────────────

const specifierMap = new Map(Object.entries(ALIASES));

function toSpecifier(relPath) {
  return `@/${relPath.replace(/\\/g, "/").replace(/\.(tsx?|jsx?)$/, "")}`;
}

function registerMove(from, to) {
  const fromSpec = toSpecifier(from);
  const toSpec = toSpecifier(to);
  specifierMap.set(fromSpec, toSpec);
  // Um `index.ts` também é alcançável pelo caminho do diretório.
  if (/(^|\/)index$/.test(fromSpec)) {
    specifierMap.set(fromSpec.replace(/\/index$/, ""), toSpec.replace(/\/index$/, ""));
  }
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function moveFile(from, to) {
  const src = path.join(SRC, from);
  const dest = path.join(SRC, to);
  if (!fs.existsSync(src)) {
    console.error(`  ! origem inexistente: ${from}`);
    process.exitCode = 1;
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(src, dest);
}

function pruneEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) pruneEmptyDirs(path.join(dir, entry.name));
  }
  if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
}

/** Divide `import {...} from "spec"` em vários imports conforme SPLITS. */
function applySplits(code) {
  for (const [spec, symbolMap] of Object.entries(SPLITS)) {
    const pattern = new RegExp(
      String.raw`(^[ \t]*)(import|export)(\s+type)?\s*\{([^}]*)\}\s*from\s*["']${spec}["'];?`,
      "gm",
    );
    code = code.replace(pattern, (match, indent, kind, typeKeyword, body) => {
      const buckets = new Map();
      for (const raw of body.split(",")) {
        const entry = raw.trim();
        if (!entry) continue;
        const name = entry.replace(/^type\s+/, "").split(/\s+as\s+/)[0].trim();
        const target = symbolMap[name];
        if (!target) return match; // símbolo desconhecido: preserva o original
        if (!buckets.has(target)) buckets.set(target, []);
        buckets.get(target).push(entry);
      }
      if (buckets.size === 0) return match;
      return [...buckets.entries()]
        .map(([target, names]) =>
          `${indent}${kind}${typeKeyword ?? ""} { ${names.join(", ")} } from "${target}";`,
        )
        .join("\n");
    });
  }
  return code;
}

function applySpecifierMap(code) {
  // Ordena por comprimento decrescente para casar o caminho mais específico.
  for (const [from, to] of [...specifierMap.entries()].sort((a, b) => b[0].length - a[0].length)) {
    code = code.replaceAll(`"${from}"`, `"${to}"`).replaceAll(`'${from}'`, `'${to}'`);
  }
  return code;
}

// ── execução ────────────────────────────────────────────────────────────────

console.log("1/5 · expandindo movimentos de subárvore");
const allMoves = [...MOVES];
for (const [fromDir, toDir] of TREE_MOVES) {
  const abs = path.join(SRC, fromDir);
  for (const file of walk(abs)) {
    const rel = path.relative(abs, file).replace(/\\/g, "/");
    allMoves.push([`${fromDir}/${rel}`, `${toDir}/${rel}`]);
  }
}

console.log(`2/5 · registrando ${allMoves.length} specifiers`);
for (const [from, to] of allMoves) registerMove(from, to);

console.log("3/5 · movendo arquivos");
for (const [from, to] of allMoves) moveFile(from, to);

console.log("4/5 · removendo código morto");
for (const rel of DELETES) {
  const target = path.join(SRC, rel);
  if (fs.existsSync(target)) fs.rmSync(target);
}

console.log("5/5 · reescrevendo imports");
let touched = 0;
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    if (!CODE_EXT.has(path.extname(file))) continue;
    const before = fs.readFileSync(file, "utf8");
    const after = applySpecifierMap(applySplits(before));
    if (after !== before) {
      fs.writeFileSync(file, after);
      touched += 1;
    }
  }
}

pruneEmptyDirs(SRC);

const LEGACY_DIRS = ["app", "components", "features", "hooks", "lib", "schemas", "services", "stores", "types"];
const leftovers = LEGACY_DIRS.flatMap((dir) => {
  const abs = path.join(SRC, dir);
  return fs.existsSync(abs) ? walk(abs).map((f) => path.relative(SRC, f).replace(/\\/g, "/")) : [];
});

console.log(`\nConcluído: ${allMoves.length} arquivos movidos, ${touched} arquivos reescritos.`);
if (leftovers.length > 0) {
  console.log(`\nArquivos remanescentes em diretórios legados (${leftovers.length}):`);
  for (const rel of leftovers) console.log(`  - ${rel}`);
}
