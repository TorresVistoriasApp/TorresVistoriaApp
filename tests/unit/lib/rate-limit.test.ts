import { describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

describe("rate-limit", () => {
  it("bloqueia após max tentativas", () => {
    resetRateLimit("test-key");
    expect(checkRateLimit("test-key", 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit("test-key", 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit("test-key", 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit("test-key", 3, 60_000).allowed).toBe(false);
  });

  it("reseta bucket", () => {
    resetRateLimit("reset-key");
    checkRateLimit("reset-key", 1, 60_000);
    resetRateLimit("reset-key");
    expect(checkRateLimit("reset-key", 1, 60_000).allowed).toBe(true);
  });
});
