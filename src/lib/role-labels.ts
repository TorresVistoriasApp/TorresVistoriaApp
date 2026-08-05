import { FutureUserRole, UserRole, type TenantRoleCode } from "@/lib/enums";

/** Rótulos em português para exibição na UI (o código interno permanece em inglês). */
export const ROLE_LABELS: Record<TenantRoleCode, string> = {
  [UserRole.SUPER_ADMIN]: "Super Admin",
  [UserRole.INSPECTOR]: "Vistoriador",
  [FutureUserRole.FINANCIAL]: "Financeiro",
  [FutureUserRole.MANAGER]: "Gestor",
  [FutureUserRole.READ_ONLY]: "Somente leitura",
  [FutureUserRole.SUPPORT]: "Suporte",
  [FutureUserRole.OWNER]: "Proprietário",
};

export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role as TenantRoleCode] ?? role;
}
