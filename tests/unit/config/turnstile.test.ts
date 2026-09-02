import { describe, expect, it } from "vitest";
import { getTurnstileSiteKey, isTurnstileEnabled } from "@/config/turnstile";

describe("Turnstile (Camada 4) — configuração do frontend", () => {
  it("fica desligado sem site key (dev local / E2E)", () => {
    expect(getTurnstileSiteKey()).toBeUndefined();
    expect(isTurnstileEnabled()).toBe(false);
  });
});
