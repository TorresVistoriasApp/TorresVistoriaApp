import { describe, expect, it } from "vitest";
import { SaasFeature, SubscriptionPlan } from "@/core/subscription/types";
import {
  getPlanLimits,
  planHasFeature,
  resolveSubscriptionPlan,
} from "@/core/subscription/plan-catalog";
import {
  canAddUser,
  canCreateInspection,
  canUseFeature,
  mergeCustomPermissions,
} from "@/core/subscription/plan-limit-service";

describe("saas plan catalog", () => {
  it("resolve plano desconhecido como starter", () => {
    expect(resolveSubscriptionPlan("invalid")).toBe(SubscriptionPlan.STARTER);
  });

  it("enterprise não tem limite de usuários", () => {
    expect(getPlanLimits(SubscriptionPlan.ENTERPRISE).maxUsers).toBeNull();
  });

  it("professional habilita API pública e filiais", () => {
    expect(planHasFeature(SubscriptionPlan.PROFESSIONAL, SaasFeature.PUBLIC_API)).toBe(true);
    expect(planHasFeature(SubscriptionPlan.PROFESSIONAL, SaasFeature.MULTI_BRANCH)).toBe(true);
  });

  it("starter não habilita marketplace", () => {
    expect(planHasFeature(SubscriptionPlan.STARTER, SaasFeature.MARKETPLACE)).toBe(false);
  });
});

describe("saas plan limits", () => {
  it("bloqueia novo usuário quando limite do starter é atingido", () => {
    const result = canAddUser(SubscriptionPlan.STARTER, { users: 3 });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Starter");
  });

  it("permite vistoria dentro do limite mensal", () => {
    const result = canCreateInspection(SubscriptionPlan.STARTER, {
      inspectionsThisMonth: 10,
    });
    expect(result.allowed).toBe(true);
  });

  it("bloqueia feature não incluída no plano", () => {
    const result = canUseFeature(SubscriptionPlan.STARTER, SaasFeature.ERP_SYNC);
    expect(result.allowed).toBe(false);
  });
});

describe("saas custom permissions merge", () => {
  it("adiciona e revoga permissões customizadas", () => {
    const base = new Set(["inspections.create" as const]);
    const merged = mergeCustomPermissions(base, [
      { permission: "users.manage", granted: true },
      { permission: "inspections.create", granted: false },
    ]);
    expect(merged.has("users.manage")).toBe(true);
    expect(merged.has("inspections.create")).toBe(false);
  });
});
