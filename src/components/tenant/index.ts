/** Componentes reutilizáveis multi-tenant (Etapa 15). */

export { CompanyAvatar } from "@/components/tenant/company-avatar";
export { CompanyBadge } from "@/components/tenant/company-badge";
export { CompanyLogo } from "@/components/tenant/company-logo";
export { RoleBadge } from "@/components/tenant/role-badge";
export { UserBadge } from "@/components/tenant/user-badge";

export { CompanyProvider, useCompanyContext } from "@/app/company-context";
export { PermissionProvider, usePermission, usePermissionContext } from "@/app/permission-context";
export { PermissionGuard } from "@/components/shared/permission-guard";
export { RoleGuard } from "@/components/shared/role-guard";
export { ProtectedRoute } from "@/components/shared/protected-route";
