import { describe, expect, it } from "vitest";
import { hasPermission } from "@/core/rbac/permissions";
import { UserRole } from "@/core/rbac/roles";
import { PERMISSIONS } from "@/core/rbac/permissions";

/**
 * Garante que PERMISSIONS no frontend está alinhado ao seed do banco.
 *
 * Uma permissão que existe só de um lado é pior do que não existir: a UI libera
 * a ação e o RLS nega (ou o inverso). Ao criar um código novo, adicione-o aqui e
 * na migration correspondente.
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
    "consulta.create",
    "consulta.read.own",
    "consulta.read.all",
    "consulta.credits.manage",
  ] as const;

  it("mapeia os códigos do seed", () => {
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
      "consulta.create",
      "consulta.read.own",
    ]);
  });
});
