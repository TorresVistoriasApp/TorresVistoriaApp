import { beforeEach, describe, expect, it, vi } from "vitest";

const invoke = vi.fn();

vi.mock("@/infra/supabase/client", () => ({
  db: {
    functions: {
      invoke: (...args: unknown[]) => invoke(...args),
    },
  },
}));

describe("invokeCreateReport", () => {
  beforeEach(() => {
    invoke.mockReset();
  });

  it("desembrulha payload aninhado em data", async () => {
    const { invokeCreateReport } = await import(
      "@/modules/torres-vistoria/services/create-report-client"
    );
    invoke.mockResolvedValueOnce({
      data: {
        data: {
          verificationCode: "TV-1",
          validationUrl: "https://app.test/validar/TV-1",
          contentDigest: "d".repeat(64),
          issueToken: "token.sig",
          needsClientPdf: true,
        },
      },
      error: null,
    });
    await expect(invokeCreateReport({ inspectionId: "insp-1" })).resolves.toMatchObject({
      verificationCode: "TV-1",
      issueToken: "token.sig",
    });
  });

  it("status 429 no response vira limite temporário, mesmo com data vazia", async () => {
    const { invokeCreateReport } = await import(
      "@/modules/torres-vistoria/services/create-report-client"
    );
    invoke.mockResolvedValueOnce({
      data: null,
      error: { message: "Edge Function returned a non-2xx status code" },
      response: new Response("{}", {
        status: 429,
        headers: { "Retry-After": "120" },
      }),
    });
    await expect(invokeCreateReport({ inspectionId: "insp-1" })).rejects.toThrow(/limite temporário/);
  });

  it("corpo de limite sem HTTP 429 também não vira contexto incompleto", async () => {
    const { invokeCreateReport } = await import(
      "@/modules/torres-vistoria/services/create-report-client"
    );
    invoke.mockResolvedValueOnce({
      data: { error: "Muitas tentativas. Aguarde e tente novamente." },
      error: null,
    });
    await expect(invokeCreateReport({ inspectionId: "insp-1" })).rejects.toThrow(/limite temporário/);
  });
});
