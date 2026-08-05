import { describe, expect, it } from "vitest";
import { hasPermission } from "@/lib/rbac";
import { UserRole } from "@/lib/enums";
import { PERMISSIONS } from "@/lib/rbac";

/**
 * Garante que PERMISSIONS no frontend está alinhado ao seed do banco (9 códigos).
 */
describe("RBAC seed alignment", () => {
  const dbPermissionCodes = [
    "inspections.create",
    "inspections.read.own",
    "inspections.read.all",
    "inspections.update.own",
    "financial.manage",
    "financial.read.own",
    "reports.export",
    "settings.manage",
    "users.manage",
  ] as const;

  it("mapeia os 9 códigos do seed", () => {
    expect(Object.keys(PERMISSIONS).sort()).toEqual([...dbPermissionCodes].sort());
  });

  it("inspector tem permissões operacionais", () => {
    const inspectorPerms = dbPermissionCodes.filter((code) =>
      hasPermission(UserRole.INSPECTOR, code),
    );
    expect(inspectorPerms).toEqual([
      "inspections.create",
      "inspections.read.own",
      "inspections.update.own",
      "financial.read.own",
      "reports.export",
    ]);
  });
});
