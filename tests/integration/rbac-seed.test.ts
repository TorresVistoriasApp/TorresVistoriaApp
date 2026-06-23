import { describe, expect, it } from "vitest";
import { hasPermission } from "@/lib/rbac";
import { UserRole } from "@/lib/enums";
import { PERMISSIONS } from "@/lib/rbac";

/**
 * Garante que PERMISSIONS no frontend está alinhado ao seed do banco (8 códigos).
 */
describe("RBAC seed alignment", () => {
  const dbPermissionCodes = [
    "inspections.create",
    "inspections.read.own",
    "inspections.read.all",
    "inspections.update.own",
    "financial.manage",
    "reports.export",
    "settings.manage",
    "users.manage",
  ] as const;

  it("mapeia os 8 códigos do seed", () => {
    expect(Object.keys(PERMISSIONS).sort()).toEqual([...dbPermissionCodes].sort());
  });

  it("vistoriador tem permissões operacionais", () => {
    const vistoriadorPerms = dbPermissionCodes.filter((code) =>
      hasPermission(UserRole.VISTORIADOR, code),
    );
    expect(vistoriadorPerms).toEqual([
      "inspections.create",
      "inspections.read.own",
      "inspections.update.own",
      "reports.export",
    ]);
  });
});
