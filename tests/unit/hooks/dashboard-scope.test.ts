import { describe, expect, it } from "vitest";
import { PermissionService } from "@/services/permission-service";
import { UserRole } from "@/lib/enums";

describe("dashboard scope permissions", () => {
  it("SUPER_ADMIN enxerga visão da empresa", () => {
    const checker = PermissionService.forRole(UserRole.SUPER_ADMIN);
    expect(checker.has("inspections.read.all")).toBe(true);
    expect(checker.has("financial.manage")).toBe(true);
    expect(checker.has("users.manage")).toBe(true);
  });

  it("INSPECTOR enxerga apenas visão pessoal", () => {
    const checker = PermissionService.forRole(UserRole.INSPECTOR);
    expect(checker.has("inspections.read.all")).toBe(false);
    expect(checker.has("inspections.read.own")).toBe(true);
    expect(checker.has("financial.manage")).toBe(false);
    expect(checker.has("users.manage")).toBe(false);
  });
});
