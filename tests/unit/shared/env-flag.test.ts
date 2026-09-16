import { describe, expect, it } from "vitest";
import { isEnvFlagTrue } from "@/shared/lib/env-flag";

describe("isEnvFlagTrue", () => {
  it("só liga com literal true após trim", () => {
    expect(isEnvFlagTrue("true")).toBe(true);
    expect(isEnvFlagTrue(" true ")).toBe(true);
  });

  it("rejeita valores ambíguos que poderiam parecer booleanos", () => {
    for (const value of ["TRUE", "True", "false", "1", "0", "yes", "on", "", undefined]) {
      expect(isEnvFlagTrue(value)).toBe(false);
    }
  });
});
