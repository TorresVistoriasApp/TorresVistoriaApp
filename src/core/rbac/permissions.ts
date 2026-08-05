import type { UserRole } from "@/core/rbac/roles";

/**
 * Matriz de autorização do Ecossistema Torres — fonte única de verdade.
 *
 * Toda decisão de acesso da aplicação resolve nesta tabela. Componentes, hooks
 * e rotas perguntam por *permissão* (`inspections.read.all`), nunca por papel
 * (`role === "SUPER_ADMIN"`); assim ativar um novo perfil é editar este arquivo
 * e nada mais.
 *
 * As seções espelham os módulos para manter a leitura próxima do produto, mas a
 * tabela permanece centralizada de propósito: uma varredura única responde
 * "quem pode fazer o quê" em toda a plataforma.
 *
 * Convenção dos nomes: `<recurso>.<ação>[.<escopo>]`, onde `own` restringe ao
 * registro do próprio usuário e `all` abrange toda a empresa.
 */
export const PERMISSIONS = {
  // ── Torres Vistoria ───────────────────────────────────────────────────────
  "inspections.create": ["SUPER_ADMIN", "INSPECTOR"],
  "inspections.read.own": ["SUPER_ADMIN", "INSPECTOR"],
  "inspections.read.all": ["SUPER_ADMIN"],
  "inspections.update.own": ["SUPER_ADMIN", "INSPECTOR"],
  "financial.manage": ["SUPER_ADMIN"],
  "financial.read.own": ["SUPER_ADMIN", "INSPECTOR"],
  "reports.export": ["SUPER_ADMIN", "INSPECTOR"],

  // ── Administração do tenant ───────────────────────────────────────────────
  "settings.manage": ["SUPER_ADMIN"],
  "users.manage": ["SUPER_ADMIN"],

  // ── Torres Consulta ───────────────────────────────────────────────────────
  "consulta.create": ["SUPER_ADMIN", "INSPECTOR"],
  "consulta.read.own": ["SUPER_ADMIN", "INSPECTOR"],
  "consulta.read.all": ["SUPER_ADMIN"],
  "consulta.credits.manage": ["SUPER_ADMIN"],
} as const satisfies Record<string, UserRole[]>;

export type Permission = keyof typeof PERMISSIONS;

/** Lista completa de permissões conhecidas. Útil para telas de administração. */
export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly UserRole[]).includes(role);
}

export function isSuperAdmin(role: UserRole | undefined): boolean {
  return role === "SUPER_ADMIN";
}

export function isInspector(role: UserRole | undefined): boolean {
  return role === "INSPECTOR";
}

/**
 * Vistoria só é visível para quem a registrou, salvo permissão de leitura ampla.
 * Espelha a política RLS de `inspections` — manter os dois lados em sincronia.
 */
export function canViewInspection(
  role: UserRole | undefined,
  inspectorId: string,
  userId: string | undefined,
): boolean {
  if (!role || !userId) return false;
  if (hasPermission(role, "inspections.read.all")) return true;
  return inspectorId === userId;
}
