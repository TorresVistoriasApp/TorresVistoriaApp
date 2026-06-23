import { describe, expect, it } from "vitest";
import { hasPermission, canViewInspection, isSuperAdmin } from "@/lib/rbac";
import { UserRole } from "@/lib/enums";

describe("rbac", () => {
  it("SUPER_ADMIN tem financial.manage", () => {
    expect(hasPermission(UserRole.SUPER_ADMIN, "financial.manage")).toBe(true);
  });

  it("VISTORIADOR não tem financial.manage", () => {
    expect(hasPermission(UserRole.VISTORIADOR, "financial.manage")).toBe(false);
  });

  it("VISTORIADOR pode criar vistorias", () => {
    expect(hasPermission(UserRole.VISTORIADOR, "inspections.create")).toBe(true);
  });

  it("isSuperAdmin identifica admin", () => {
    expect(isSuperAdmin(UserRole.SUPER_ADMIN)).toBe(true);
    expect(isSuperAdmin(UserRole.VISTORIADOR)).toBe(false);
  });

  it("canViewInspection — vistoriador vê só a própria", () => {
    const inspectorId = "user-1";
    expect(canViewInspection(UserRole.VISTORIADOR, inspectorId, "user-1")).toBe(true);
    expect(canViewInspection(UserRole.VISTORIADOR, inspectorId, "user-2")).toBe(false);
  });

  it("canViewInspection — admin vê todas", () => {
    expect(canViewInspection(UserRole.SUPER_ADMIN, "any-id", "admin-id")).toBe(true);
  });
});
