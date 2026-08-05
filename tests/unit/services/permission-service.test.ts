import { describe, expect, it } from "vitest";
import {
  createPermissionChecker,
  createPermissionCheckerWithGrants,
  PermissionService,
  resolvePermissionsForRole,
} from "@/core/rbac/permission-service";
import { UserRole } from "@/core/rbac/roles";

describe("permission-service", () => {
  it("SUPER_ADMIN recebe permissões administrativas", () => {
    const permissions = resolvePermissionsForRole(UserRole.SUPER_ADMIN);
    expect(permissions).toContain("users.manage");
    expect(permissions).toContain("financial.manage");
    expect(permissions).toContain("inspections.read.all");
  });

  it("INSPECTOR não recebe permissões administrativas", () => {
    const permissions = resolvePermissionsForRole(UserRole.INSPECTOR);
    expect(permissions).toContain("inspections.create");
    expect(permissions).not.toContain("users.manage");
    expect(permissions).not.toContain("financial.manage");
  });

  it("papel indefinido retorna lista vazia", () => {
    expect(resolvePermissionsForRole(undefined)).toEqual([]);
  });

  it("createPermissionChecker expõe API unificada", () => {
    const checker = createPermissionChecker(UserRole.INSPECTOR);
    expect(checker.has("inspections.create")).toBe(true);
    expect(checker.has("financial.manage")).toBe(false);
    expect(checker.hasAny("inspections.create", "financial.manage")).toBe(true);
    expect(checker.hasRole(UserRole.INSPECTOR)).toBe(true);
    expect(checker.hasAnyRole([UserRole.SUPER_ADMIN, UserRole.INSPECTOR])).toBe(true);
    expect(checker.isInspector).toBe(true);
    expect(checker.isSuperAdmin).toBe(false);
    expect(checker.canViewInspection("inspector-1", "inspector-1")).toBe(true);
    expect(checker.canViewInspection("inspector-1", "other")).toBe(false);
  });

  it("PermissionService.forRole delega para createPermissionChecker", () => {
    const checker = PermissionService.forRole(UserRole.SUPER_ADMIN);
    expect(checker.has("settings.manage")).toBe(true);
  });

  it("createPermissionCheckerWithGrants mescla overrides customizados", () => {
    const checker = createPermissionCheckerWithGrants(UserRole.INSPECTOR, [
      { permission: "users.manage", granted: true },
    ]);
    expect(checker.has("users.manage")).toBe(true);
    expect(checker.has("inspections.create")).toBe(true);
  });
});
