import { describe, expect, it } from "vitest";
import {
  getEdgeErrorMessage,
  officialLaudoRateLimitMessage,
  parseRetryAfterSeconds,
  throwIfEdgeError,
} from "@/core/errors/app-error";

describe("P.5 — HTTP 429 da emissão oficial", () => {
  it("identifica 429 e interpreta Retry-After", async () => {
    const response = new Response(JSON.stringify({ error: "Muitas tentativas. Aguarde e tente novamente." }), {
      status: 429,
      headers: { "Retry-After": "499", "Content-Type": "application/json" },
    });
    const message = await getEdgeErrorMessage({ context: response });
    expect(parseRetryAfterSeconds("499")).toBe(499);
    expect(message).toContain("limite temporário");
    expect(message).toContain("9 minuto(s)");
    expect(message).not.toContain("não liberou o contexto");
  });

  it("429 sem Retry-After ainda é mensagem de limite temporário", async () => {
    const response = new Response("{}", { status: 429 });
    const message = await getEdgeErrorMessage({ context: response });
    expect(message).toBe(officialLaudoRateLimitMessage());
    expect(message).not.toContain("não liberou o contexto");
  });

  it("throwIfEdgeError não converte 429 em contexto não liberado", async () => {
    const response = new Response(JSON.stringify({ error: "ignored body" }), {
      status: 429,
      headers: { "Retry-After": "30" },
    });
    await expect(throwIfEdgeError({ context: response }, { error: "ignored body" })).rejects.toThrow(
      /limite temporário/,
    );
  });

  it("corpo 429 sem status no error object não usa a mensagem genérica de contexto", async () => {
    await expect(
      throwIfEdgeError(null, { error: "Muitas tentativas. Aguarde e tente novamente." }),
    ).rejects.toThrow(/limite temporário/);
  });
});
