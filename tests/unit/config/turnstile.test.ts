import { describe, expect, it } from "vitest";
import { getTurnstileSiteKey, isTurnstileEnabled, isTurnstileRequired } from "@/config/turnstile";

describe("Turnstile (Camada 4) — configuração do frontend", () => {
  it("fica desligado sem site key e sem VITE_TURNSTILE_REQUIRED (dev local / E2E)", () => {
    expect(getTurnstileSiteKey()).toBeUndefined();
    expect(isTurnstileRequired()).toBe(false);
    expect(isTurnstileEnabled()).toBe(false);
  });
});
