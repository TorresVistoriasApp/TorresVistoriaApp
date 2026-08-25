import { describe, expect, it } from "vitest";
import {
  getCompanyInitials,
  getCompanyPlanLabel,
  getCompanyStatusLabel,
} from "@/core/tenant/company-display";

describe("company-display", () => {
  it("getCompanyInitials gera iniciais do nome fantasia", () => {
    expect(getCompanyInitials("Torres Vistorias")).toBe("TV");
    expect(getCompanyInitials("  Acme  ")).toBe("A");
    expect(getCompanyInitials(null)).toBe("EM");
  });

  it("getCompanyPlanLabel traduz planos conhecidos", () => {
    expect(getCompanyPlanLabel("starter")).toBe("Starter");
    expect(getCompanyPlanLabel("custom")).toBe("custom");
  });

  it("getCompanyStatusLabel traduz status conhecidos", () => {
    expect(getCompanyStatusLabel("active")).toBe("Ativa");
    expect(getCompanyStatusLabel("unknown")).toBe("unknown");
  });
});
