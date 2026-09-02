export {
  TenantProvider,
  useTenantContext,
  type TenantContextValue,
} from "@/core/tenant/tenant-context";

export {
  useTenant,
  useTenantSettings,
  useUpdateTenant,
  useUpdateTenantSettings,
  useUploadTenantAsset,
} from "@/core/tenant/use-tenant";

export { TenantGuard } from "@/core/tenant/tenant-guard";
export {
  resolveTenant,
  resolvedTenantId,
  tenantSlugFromHostname,
  tenantIdFromAppMetadata,
  isTenantId,
  type TenantId,
  type TenantResolution,
  type TenantResolverInput,
  type TenantSource,
} from "@/core/tenant/tenant-resolver";

export {
  canAccessTenantRow,
  canAccessFinancialRow,
  canAccessAuditLog,
  storagePathTenantId,
  storagePathBelongsToTenant,
  isCrossTenantStoragePath,
  filterVisibleProfiles,
  type TenantSession,
  type TenantResource,
  type FinancialResource,
} from "@/core/tenant/tenant-policy";

export { requireTenantId, requireUserId } from "@/core/tenant/tenant";
export { companyService, type Company, type CompanySettings } from "@/core/tenant/company-service";
