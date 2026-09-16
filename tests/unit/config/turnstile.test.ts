import { afterEach, describe, expect, it, vi } from "vitest";
import { getTurnstileSiteKey, isTurnstileEnabled, isTurnstileRequired } from "@/config/turnstile";

describe("Turnstile (Camada 4) — configuração do frontend", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fica desligado sem site key e sem VITE_TURNSTILE_REQUIRED (dev local / E2E)", () => {
    vi.stubEnv("VITE_TURNSTILE_SITE_KEY", "");
    vi.stubEnv("VITE_TURNSTILE_REQUIRED", "");
    expect(getTurnstileSiteKey()).toBeUndefined();
    expect(isTurnstileRequired()).toBe(false);
    expect(isTurnstileEnabled()).toBe(false);
  });

  it("habilitado com site key e required=true (produção / O.6-E)", () => {
    vi.stubEnv("VITE_TURNSTILE_SITE_KEY", "0x4AAAAAAE5P6MQtZz8jkdVF");
    vi.stubEnv("VITE_TURNSTILE_REQUIRED", "true");
    expect(getTurnstileSiteKey()).toBeDefined();
    expect(isTurnstileRequired()).toBe(true);
    expect(isTurnstileEnabled()).toBe(true);
  });

  it("required=TRUE literal não liga o widget", () => {
    vi.stubEnv("VITE_TURNSTILE_SITE_KEY", "");
    vi.stubEnv("VITE_TURNSTILE_REQUIRED", "TRUE");
    expect(isTurnstileRequired()).toBe(false);
  });
});
