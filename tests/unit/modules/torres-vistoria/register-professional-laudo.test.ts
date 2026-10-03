import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Inspection } from "@/modules/torres-vistoria/services/inspection-service";

const invokeCreateReport = vi.fn();
const generateLaudoPdf = vi.fn();
const laudoPdfBlobToBase64 = vi.fn();

vi.mock("@/modules/torres-vistoria/services/create-report-client", () => ({
  invokeCreateReport: (...args: unknown[]) => invokeCreateReport(...args),
}));

vi.mock("@/modules/torres-vistoria/services/laudo-pdf-download", () => ({
  generateLaudoPdf: (...args: unknown[]) => generateLaudoPdf(...args),
  laudoPdfBlobToBase64: (...args: unknown[]) => laudoPdfBlobToBase64(...args),
}));

vi.mock("@/infra/supabase/client", () => ({
  db: {
    functions: { invoke: vi.fn() },
    from: vi.fn(),
    storage: {
      from: () => ({
        download: vi.fn().mockResolvedValue({ data: new Blob(["official"]), error: null }),
      }),
    },
  },
}));

const inspection = {
  id: "insp-1",
  inspection_number: 12,
  plate: "ABC1D23",
} as Inspection;

describe("P.5 — registerProfessionalLaudo chama create-report duas vezes", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      setTimeout,
      clearTimeout,
      document: {
        createElement: () => ({ href: "", download: "", rel: "", click: vi.fn() }),
      },
    });
    vi.stubGlobal("document", {
      createElement: () => ({ href: "", download: "", rel: "", click: vi.fn() }),
    });
    Object.assign(URL, {
      createObjectURL: () => "blob:test",
      revokeObjectURL: () => undefined,
    });
    invokeCreateReport.mockReset();
    generateLaudoPdf.mockReset();
    laudoPdfBlobToBase64.mockReset();
    generateLaudoPdf.mockResolvedValue(new Blob(["pdf"]));
    laudoPdfBlobToBase64.mockResolvedValue("cGRm");
    invokeCreateReport
      .mockResolvedValueOnce({
        verificationCode: "TV-TEST-CODE-0001",
        validationUrl: "https://app.test/validar/TV-TEST-CODE-0001",
        contentDigest: "d".repeat(64),
        issueToken: "token.sig",
      })
      .mockResolvedValueOnce({
        integrityHash: "h".repeat(64),
        storagePath: "tenant/insp-1/laudo.pdf",
      });
  });

  async function loadPdfService() {
    const { pdfService } = await import("@/modules/torres-vistoria/services/pdf-service");
    pdfService.downloadPdf = vi.fn().mockResolvedValue(new Blob(["official"]));
    pdfService.downloadPdfBlob = vi.fn().mockResolvedValue(undefined);
    return pdfService;
  }

  it("uma emissão normal: PREPARE + SEAL, sem retry e sem terceiro invoke", async () => {
    const pdfService = await loadPdfService();

    await pdfService.registerProfessionalLaudo({
      inspection,
      checklist: [],
      photos: [],
    });

    expect(invokeCreateReport).toHaveBeenCalledTimes(2);
    expect(invokeCreateReport.mock.calls[0][0]).toEqual({ inspectionId: "insp-1" });
    expect(invokeCreateReport.mock.calls[1][0]).toMatchObject({
      inspectionId: "insp-1",
      pdfBase64: "cGRm",
      issueToken: "token.sig",
      verificationCode: "TV-TEST-CODE-0001",
      contentDigest: "d".repeat(64),
    });
    expect(generateLaudoPdf).toHaveBeenCalledTimes(1);
    expect(generateLaudoPdf.mock.calls[0][0]).toMatchObject({ mode: "official" });
  });

  it("erro no PREPARE não chama SEAL nem gera PDF", async () => {
    invokeCreateReport.mockReset();
    invokeCreateReport.mockRejectedValueOnce(new Error("PREPARE falhou"));
    const pdfService = await loadPdfService();
    await expect(
      pdfService.registerProfessionalLaudo({ inspection, checklist: [], photos: [] }),
    ).rejects.toThrow("PREPARE falhou");
    expect(invokeCreateReport).toHaveBeenCalledTimes(1);
    expect(generateLaudoPdf).not.toHaveBeenCalled();
  });

  it("erro na geração do PDF não chama SEAL", async () => {
    generateLaudoPdf.mockRejectedValueOnce(new Error("PDF falhou"));
    const pdfService = await loadPdfService();
    await expect(
      pdfService.registerProfessionalLaudo({ inspection, checklist: [], photos: [] }),
    ).rejects.toThrow("PDF falhou");
    expect(invokeCreateReport).toHaveBeenCalledTimes(1);
  });

  it("erro no SEAL não introduz retry automático", async () => {
    invokeCreateReport.mockReset();
    invokeCreateReport
      .mockResolvedValueOnce({
        verificationCode: "TV-TEST-CODE-0001",
        validationUrl: "https://app.test/validar/TV-TEST-CODE-0001",
        contentDigest: "d".repeat(64),
        issueToken: "token.sig",
      })
      .mockRejectedValueOnce(new Error("SEAL falhou"));
    const pdfService = await loadPdfService();
    await expect(
      pdfService.registerProfessionalLaudo({ inspection, checklist: [], photos: [] }),
    ).rejects.toThrow("SEAL falhou");
    expect(invokeCreateReport).toHaveBeenCalledTimes(2);
  });
});
