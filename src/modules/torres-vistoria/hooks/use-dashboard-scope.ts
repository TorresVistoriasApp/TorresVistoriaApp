import { usePermission } from "@/core/rbac/use-permission";

/** Escopo do dashboard: visão da empresa (admin) vs visão pessoal (vistoriador). */
export function useDashboardScope() {
  const { can, isSuperAdmin, isInspector } = usePermission();

  const isCompanyView = can("inspections.read.all");
  const isPersonalView = isInspector && !isCompanyView;

  return {
    isCompanyView,
    isPersonalView,
    isSuperAdmin,
    canViewFinancial: can("financial.manage") || can("financial.read.own"),
    canManageUsers: can("users.manage"),
    canExportReports: can("reports.export"),
  };
}
