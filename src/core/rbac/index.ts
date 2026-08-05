/**
 * API pública do subsistema de autorização.
 *
 * Módulos devem importar daqui em vez de alcançar arquivos internos, para que a
 * implementação da matriz possa evoluir (ex.: grants vindos do banco) sem
 * ondas de refatoração pelo resto do código.
 */

export {
  PrincipalType,
  UserRole,
  FutureUserRole,
  CustomerRole,
  UserStatus,
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
  getRoleLabel,
  type TenantRoleCode,
  type AnyRole,
} from "@/core/rbac/roles";

export {
  PERMISSIONS,
  ALL_PERMISSIONS,
  hasPermission,
  canViewInspection,
  type Permission,
} from "@/core/rbac/permissions";

export {
  AccessScope,
  inspectionScope,
  financialScope,
  consultaScope,
  assignableRoles,
  canManageUser,
  isPrivilegedRole,
} from "@/core/rbac/policies";

export {
  createPermissionChecker,
  createPermissionCheckerWithGrants,
  resolvePermissionsForRole,
  PermissionService,
  type PermissionChecker,
} from "@/core/rbac/permission-service";

export { PermissionProvider, usePermissionContext, useRole } from "@/core/rbac/permission-context";
export { usePermission } from "@/core/rbac/use-permission";
export { PermissionGuard } from "@/core/rbac/components/permission-guard";
export {
  RequirePermission,
  RequireAnyPermission,
} from "@/core/rbac/components/require-permission";
