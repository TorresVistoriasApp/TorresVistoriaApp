import type { UserRole } from "@/lib/enums";

export const PERMISSIONS = {
  "inspections.create": ["SUPER_ADMIN", "VISTORIADOR"],
  "inspections.read.own": ["SUPER_ADMIN", "VISTORIADOR"],
  "inspections.read.all": ["SUPER_ADMIN"],
  "inspections.update.own": ["SUPER_ADMIN", "VISTORIADOR"],
  "financial.manage": ["SUPER_ADMIN"],
  "reports.export": ["SUPER_ADMIN", "VISTORIADOR"],
  "settings.manage": ["SUPER_ADMIN"],
  "users.manage": ["SUPER_ADMIN"],
} as const satisfies Record<string, UserRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly UserRole[]).includes(role);
}

export function isSuperAdmin(role: UserRole | undefined): boolean {
  return role === "SUPER_ADMIN";
}

export function canViewInspection(
  role: UserRole | undefined,
  inspectorId: string,
  userId: string | undefined,
): boolean {
  if (!role || !userId) return false;
  if (isSuperAdmin(role)) return true;
  return inspectorId === userId;
}
