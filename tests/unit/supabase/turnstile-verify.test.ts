import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TurnstileError, verifyTurnstileToken } from "../../../supabase/functions/_shared/turnstile.ts";

function stubDenoEnv(values: Record<string, string | undefined>) {
  vi.stubGlobal("Deno", {
    env: {
      get: (key: string) => values[key],
    },
  });
}

describe("verifyTurnstileToken (Edge shared)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("required=true + secret ausente → bloqueia", async () => {
    stubDenoEnv({ TURNSTILE_REQUIRED: "true" });
    await expect(verifyTurnstileToken("any")).rejects.toBeInstanceOf(TurnstileError);
  });

  it("required=false + secret ausente → no-op (dev documentado)", async () => {
    stubDenoEnv({});
    await expect(verifyTurnstileToken(undefined)).resolves.toBeUndefined();
  });

  it("secret presente + token ausente → bloqueia", async () => {
    stubDenoEnv({ TURNSTILE_SECRET_KEY: "test-secret" });
    await expect(verifyTurnstileToken("")).rejects.toBeInstanceOf(TurnstileError);
  });

  it("required=true + token inválido (siteverify success=false) → bloqueia", async () => {
    stubDenoEnv({ TURNSTILE_SECRET_KEY: "test-secret", TURNSTILE_REQUIRED: "true" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: false }),
      }),
    );
    await expect(verifyTurnstileToken("bad-token")).rejects.toBeInstanceOf(TurnstileError);
  });

  it("required=true + HTTP erro Cloudflare → bloqueia", async () => {
    stubDenoEnv({ TURNSTILE_SECRET_KEY: "test-secret", TURNSTILE_REQUIRED: "true" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      }),
    );
    await expect(verifyTurnstileToken("token")).rejects.toBeInstanceOf(TurnstileError);
  });

  it("required=true + JSON malformado → bloqueia", async () => {
    stubDenoEnv({ TURNSTILE_SECRET_KEY: "test-secret", TURNSTILE_REQUIRED: "true" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError("bad json");
        },
      }),
    );
    await expect(verifyTurnstileToken("token")).rejects.toBeInstanceOf(TurnstileError);
  });

  it("token válido (siteverify success) → passa", async () => {
    stubDenoEnv({ TURNSTILE_SECRET_KEY: "test-secret", TURNSTILE_REQUIRED: "true" });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(verifyTurnstileToken("good-token", "203.0.113.1")).resolves.toBeUndefined();

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    const posted = new URLSearchParams(String(init.body));
    expect(posted.get("secret")).toBe("test-secret");
    expect(posted.get("response")).toBe("good-token");
    expect(posted.get("remoteip")).toBe("203.0.113.1");
  });

  it("TURNSTILE_REQUIRED=TRUE não liga required (secret ausente → no-op)", async () => {
    stubDenoEnv({ TURNSTILE_REQUIRED: "TRUE" });
    await expect(verifyTurnstileToken(undefined)).resolves.toBeUndefined();
  });

  it("não aceita captcha em header — só body token é verificado", async () => {
    stubDenoEnv({ TURNSTILE_SECRET_KEY: "test-secret" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      }),
    );
    await verifyTurnstileToken("body-token");
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });
});
