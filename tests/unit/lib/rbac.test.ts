import { describe, expect, it } from "vitest";
import { hasPermission, canViewInspection, isSuperAdmin } from "@/lib/rbac";
import { UserRole } from "@/lib/enums";

describe("rbac", () => {
  it("SUPER_ADMIN tem financial.manage", () => {
    expect(hasPermission(UserRole.SUPER_ADMIN, "financial.manage")).toBe(true);
  });

  it("INSPECTOR não tem financial.manage", () => {
    expect(hasPermission(UserRole.INSPECTOR, "financial.manage")).toBe(false);
  });

  it("INSPECTOR tem financial.read.own", () => {
    expect(hasPermission(UserRole.INSPECTOR, "financial.read.own")).toBe(true);
  });

  it("INSPECTOR pode criar vistorias", () => {
    expect(hasPermission(UserRole.INSPECTOR, "inspections.create")).toBe(true);
  });

  it("isSuperAdmin identifica admin", () => {
    expect(isSuperAdmin(UserRole.SUPER_ADMIN)).toBe(true);
    expect(isSuperAdmin(UserRole.INSPECTOR)).toBe(false);
  });

  it("canViewInspection — inspector vê só a própria", () => {
    const inspectorId = "user-1";
    expect(canViewInspection(UserRole.INSPECTOR, inspectorId, "user-1")).toBe(true);
    expect(canViewInspection(UserRole.INSPECTOR, inspectorId, "user-2")).toBe(false);
  });

  it("canViewInspection — admin vê todas", () => {
    expect(canViewInspection(UserRole.SUPER_ADMIN, "any-id", "admin-id")).toBe(true);
  });
});
