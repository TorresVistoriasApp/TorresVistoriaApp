import { describe, expect, it } from "vitest";
import { PermissionService } from "@/services/permission-service";
import { UserRole } from "@/lib/enums";
import { getNavSections } from "@/lib/nav-items";

describe("financial scope permissions", () => {
  it("SUPER_ADMIN gerencia financeiro da empresa", () => {
    const checker = PermissionService.forRole(UserRole.SUPER_ADMIN);
    expect(checker.has("financial.manage")).toBe(true);
    expect(checker.has("financial.read.own")).toBe(true);
  });

  it("INSPECTOR vê apenas financeiro próprio", () => {
    const checker = PermissionService.forRole(UserRole.INSPECTOR);
    expect(checker.has("financial.manage")).toBe(false);
    expect(checker.has("financial.read.own")).toBe(true);
  });
});

describe("financial nav visibility", () => {
  it("INSPECTOR vê link Financeiro com escopo pessoal", () => {
    const checker = PermissionService.forRole(UserRole.INSPECTOR);
    const sections = getNavSections(checker);
    const financialSection = sections.find((section) => section.title === "Financeiro");
    expect(financialSection?.items.some((item) => item.label === "Financeiro")).toBe(true);
  });

  it("INSPECTOR não vê gestão de usuários", () => {
    const checker = PermissionService.forRole(UserRole.INSPECTOR);
    const sections = getNavSections(checker);
    expect(sections.some((section) => section.title === "Gestão")).toBe(false);
  });
});
