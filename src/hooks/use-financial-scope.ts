import { usePermission } from "@/hooks/use-permission";

/** Escopo financeiro: visão da empresa (admin) vs visão pessoal (vistoriador). */
export function useFinancialScope() {
  const { can, isSuperAdmin, isInspector } = usePermission();

  const canManageFinancial = can("financial.manage");
  const canViewOwnFinancial = can("financial.read.own");
  const canAccessFinancial = canManageFinancial || canViewOwnFinancial;
  const isCompanyView = canManageFinancial;
  const isPersonalView = isInspector && canViewOwnFinancial && !canManageFinancial;

  return {
    canManageFinancial,
    canViewOwnFinancial,
    canAccessFinancial,
    isCompanyView,
    isPersonalView,
    isSuperAdmin,
    isInspector,
  };
}
