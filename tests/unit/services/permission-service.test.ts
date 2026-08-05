import { describe, expect, it } from "vitest";
import { resolvePermissionsForRole } from "@/services/permission-service";

describe("permission-service", () => {
  it("SUPER_ADMIN recebe permissões administrativas", () => {
    const permissions = resolvePermissionsForRole("SUPER_ADMIN");
    expect(permissions).toContain("users.manage");
    expect(permissions).toContain("financial.manage");
    expect(permissions).toContain("inspections.read.all");
  });

  it("INSPECTOR não recebe permissões administrativas", () => {
    const permissions = resolvePermissionsForRole("INSPECTOR");
    expect(permissions).toContain("inspections.create");
    expect(permissions).not.toContain("users.manage");
    expect(permissions).not.toContain("financial.manage");
  });

  it("papel indefinido retorna lista vazia", () => {
    expect(resolvePermissionsForRole(undefined)).toEqual([]);
  });
});
