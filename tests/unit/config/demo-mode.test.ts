import { describe, expect, it } from "vitest";
import { isDemoModeEnabled } from "@/config/env";

describe("VITE_DEMO_MODE", () => {
  it("produção nunca liga modo demo mesmo com o flag true", () => {
    expect(isDemoModeEnabled({ prod: true, demoMode: "true" })).toBe(false);
    expect(isDemoModeEnabled({ prod: true, demoMode: "false" })).toBe(false);
  });

  it("desenvolvimento pode ligar o flag; isso não implica bypass de auth", () => {
    expect(isDemoModeEnabled({ prod: false, demoMode: "true" })).toBe(true);
    expect(isDemoModeEnabled({ prod: false, demoMode: "false" })).toBe(false);
    expect(isDemoModeEnabled({ prod: false, demoMode: undefined })).toBe(false);
  });

  it("valores inesperados não ligam demo nem em desenvolvimento", () => {
    expect(isDemoModeEnabled({ prod: false, demoMode: "1" })).toBe(false);
    expect(isDemoModeEnabled({ prod: false, demoMode: "TRUE" })).toBe(false);
    expect(isDemoModeEnabled({ prod: true, demoMode: "1" })).toBe(false);
  });
});
