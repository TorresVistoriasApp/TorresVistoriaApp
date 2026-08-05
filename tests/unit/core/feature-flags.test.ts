import { describe, expect, it, beforeEach } from "vitest";
import {
  clearFlagOverrides,
  isEnabled,
  resolveFlag,
  setFlagOverride,
} from "@/core/feature-flags";

describe("featureFlags", () => {
  beforeEach(() => {
    clearFlagOverrides();
  });

  it("usa default quando não há override", () => {
    expect(isEnabled("torres-consulta")).toBe(true);
    expect(isEnabled("torres-consulta.official-api")).toBe(false);
    expect(resolveFlag("payments").source).toBe("default");
  });

  it("override runtime tem precedência", () => {
    setFlagOverride("torres-consulta", false);
    expect(isEnabled("torres-consulta")).toBe(false);
    expect(resolveFlag("torres-consulta").source).toBe("override");
  });
});
