/**
 * @deprecated Importe de `@/core/tenant` — `TenantProvider` / `useTenantContext`.
 * Mantido como ponte durante a transição de naming.
 */
export {
  TenantProvider as CompanyProvider,
  useTenantContext as useCompanyContext,
  type TenantContextValue as CompanyContextValue,
} from "@/core/tenant/tenant-context";
