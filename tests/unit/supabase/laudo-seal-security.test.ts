import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  buildTorresPdfBindingKeywords,
  TORRES_PDF_BINDING_PREFIX,
} from "@/shared/lib/pdf-binding-markers";
import { buildLaudoPayloadFixture } from "../../helpers/laudo-payload-fixture";
import { renderLaudoPdfBytes } from "../../helpers/laudo-pdf-render";
import {
  buildLaudoContentDigest,
  pdfContainsBindingMarkers,
  sha256Hex,
  signReportIssueToken,
  verifyReportIssueToken,
} from "../../helpers/laudo-seal-harness";

const inspection = {
  id: "insp-a",
  tenant_id: "tenant-a",
  updated_at: "2026-09-24T00:00:00Z",
  inspection_number: 1,
  inspection_date: "2026-09-24",
  plate: "ABC1D23",
  chassis: "CHASSIS",
  brand: "VW",
  model: "Gol",
  opinion: "APROVADO",
  technical_notes: null,
};

const checklist = [
  { id: "c1", category: "ESTRUTURA", item_name: "Longarina", status: "CONFORME", notes: null },
];

async function digestFor(code: string, version = 1) {
  return buildLaudoContentDigest({
    inspection,
    checklist,
    photoCount: 75,
    verificationCode: code,
    nextVersion: version,
  });
}

async function minimalPdfWithText(...parts: string[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText(parts.join("\n"), { x: 40, y: 700, size: 10, font });
  return doc.save();
}

function plainLiteralPdfWithMarkers(...markers: string[]): Uint8Array {
  const body = markers.join("\n");
  const ascii = `%PDF-1.4\n% plain binding probe\n${body}\n%%EOF\n`;
  return new TextEncoder().encode(ascii);
}

async function renderOfficialPdfmake(code: string, digest: string) {
  const tinyJpeg =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==";
  return renderLaudoPdfBytes(
    buildLaudoPayloadFixture(1, tinyJpeg, {
      verificationCode: code,
      contentDigest: digest,
      integrityHash: digest,
    }),
  );
}

type SealContext = {
  inspectionId: string;
  tenantId: string;
  verificationCode: string;
  contentDigest: string;
  nextVersion: number;
  issueToken: string;
};

async function simulateSealGate(
  pdf: Uint8Array,
  ctx: SealContext,
  row: { tenant_id: string },
): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    const tokenPayload = await verifyReportIssueToken(ctx.issueToken);
    if (tokenPayload.inspectionId !== ctx.inspectionId) {
      return { ok: false, reason: "inspection" };
    }
    if (tokenPayload.tenantId !== row.tenant_id) {
      return { ok: false, reason: "tenant" };
    }
    if (
      tokenPayload.verificationCode !== ctx.verificationCode ||
      tokenPayload.contentDigest !== ctx.contentDigest ||
      tokenPayload.nextVersion !== ctx.nextVersion
    ) {
      return { ok: false, reason: "token-fields" };
    }
    if (!(await pdfContainsBindingMarkers(pdf, ctx.verificationCode, ctx.contentDigest))) {
      return { ok: false, reason: "binding" };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "token" };
  }
}

describe("P.3 / P.3.1 — binding pdfmake real (obrigatório)", () => {
  it("buildLaudoDocDefinition → pdfmake → applyTorresOfficialPdfBinding → bytes → binding true", async () => {
    const code = "TV-AAAA-BBBB-CCCC";
    const digest = await digestFor(code);
    const pdf = await renderOfficialPdfmake(code, digest);
    const latin = new TextDecoder("latin1").decode(pdf);
    const line = buildTorresPdfBindingKeywords(code, digest);
    expect(latin.includes(line)).toBe(true);
    expect(latin.includes(TORRES_PDF_BINDING_PREFIX)).toBe(true);
    expect(await pdfContainsBindingMarkers(pdf, code, digest)).toBe(true);
  });

  it("digest errado → binding false", async () => {
    const code = "TV-AAAA-BBBB-CCCC";
    const digest = await digestFor(code);
    const pdf = await renderOfficialPdfmake(code, digest);
    expect(await pdfContainsBindingMarkers(pdf, code, `${digest}x`)).toBe(false);
  });

  it("verification code errado → binding false", async () => {
    const code = "TV-AAAA-BBBB-CCCC";
    const digest = await digestFor(code);
    const pdf = await renderOfficialPdfmake(code, digest);
    expect(await pdfContainsBindingMarkers(pdf, "TV-OUTR-AAAA-BBBB", digest)).toBe(false);
  });

  it("PDF arbitrário só com linha de binding injetada pode passar binding (limitação)", async () => {
    const code = "TV-AAAA-BBBB-CCCC";
    const digest = await digestFor(code);
    const pdf = plainLiteralPdfWithMarkers(buildTorresPdfBindingKeywords(code, digest), "layout falso");
    expect(await pdfContainsBindingMarkers(pdf, code, digest)).toBe(true);
  });
});

describe("P.3 — simulação SEAL (token + binding)", () => {
  async function baseContext(code = "TV-SEAL-TEST-0001") {
    const contentDigest = await digestFor(code);
    const expMs = Date.now() + 120_000;
    const issueToken = await signReportIssueToken({
      inspectionId: inspection.id,
      tenantId: inspection.tenant_id,
      verificationCode: code,
      contentDigest,
      nextVersion: 1,
      expMs,
    });
    const pdf = await renderOfficialPdfmake(code, contentDigest);
    return {
      pdf,
      ctx: {
        inspectionId: inspection.id,
        tenantId: inspection.tenant_id,
        verificationCode: code,
        contentDigest,
        nextVersion: 1,
        issueToken,
      },
    };
  }

  it("caso A — PDF pdfmake real + token válido → SEAL permitido", async () => {
    const { pdf, ctx } = await baseContext();
    const result = await simulateSealGate(pdf, ctx, { tenant_id: inspection.tenant_id });
    expect(result).toEqual({ ok: true });
  });

  it("caso F — digest errado no corpo → SEAL negado", async () => {
    const { pdf, ctx } = await baseContext();
    const result = await simulateSealGate(pdf, { ...ctx, contentDigest: `${ctx.contentDigest}x` }, {
      tenant_id: inspection.tenant_id,
    });
    expect(result.ok).toBe(false);
  });

  it("caso G — verificationCode errado → SEAL negado", async () => {
    const { pdf, ctx } = await baseContext();
    const result = await simulateSealGate(pdf, { ...ctx, verificationCode: "TV-WRNG-CODE-XXXX" }, {
      tenant_id: inspection.tenant_id,
    });
    expect(result.ok).toBe(false);
  });

  it("caso D — inspection errada → SEAL negado", async () => {
    const { pdf, ctx } = await baseContext();
    const result = await simulateSealGate(pdf, { ...ctx, inspectionId: "outra-insp" }, {
      tenant_id: inspection.tenant_id,
    });
    expect(result.ok).toBe(false);
  });

  it("caso E — tenant errado → SEAL negado", async () => {
    const { pdf, ctx } = await baseContext();
    const result = await simulateSealGate(pdf, ctx, { tenant_id: "tenant-outro" });
    expect(result.ok).toBe(false);
  });

  it("caso E2 — nextVersion errada → SEAL negado", async () => {
    const { pdf, ctx } = await baseContext();
    const result = await simulateSealGate(pdf, { ...ctx, nextVersion: 99 }, {
      tenant_id: inspection.tenant_id,
    });
    expect(result.ok).toBe(false);
  });

  it("caso B — token adulterado → SEAL negado", async () => {
    const { pdf, ctx } = await baseContext();
    const result = await simulateSealGate(pdf, { ...ctx, issueToken: `${ctx.issueToken}x` }, {
      tenant_id: inspection.tenant_id,
    });
    expect(result.ok).toBe(false);
  });

  it("caso C — token expirado → SEAL negado", async () => {
    const code = "TV-SEAL-EXP-0001";
    const contentDigest = await digestFor(code);
    const issueToken = await signReportIssueToken({
      inspectionId: inspection.id,
      tenantId: inspection.tenant_id,
      verificationCode: code,
      contentDigest,
      nextVersion: 1,
      expMs: Date.now() - 1,
    });
    const pdf = await renderOfficialPdfmake(code, contentDigest);
    const result = await simulateSealGate(
      pdf,
      {
        inspectionId: inspection.id,
        tenantId: inspection.tenant_id,
        verificationCode: code,
        contentDigest,
        nextVersion: 1,
        issueToken,
      },
      { tenant_id: inspection.tenant_id },
    );
    expect(result.ok).toBe(false);
  });

  it("caso H — PDF com Keywords correto mas sem token válido → SEAL negado (binding isolado passa)", async () => {
    const code = "TV-NOTOK-SEAL-01";
    const contentDigest = await digestFor(code);
    const pdf = plainLiteralPdfWithMarkers(buildTorresPdfBindingKeywords(code, contentDigest));
    expect(await pdfContainsBindingMarkers(pdf, code, contentDigest)).toBe(true);
    const withoutToken = await simulateSealGate(
      pdf,
      {
        inspectionId: inspection.id,
        tenantId: inspection.tenant_id,
        verificationCode: code,
        contentDigest,
        nextVersion: 1,
        issueToken: "",
      },
      { tenant_id: inspection.tenant_id },
    );
    expect(withoutToken.ok).toBe(false);
    expect(withoutToken.reason).toBe("token");
  });
});

describe("P.3 — adulteração pós-geração (integrity_hash)", () => {
  it("caso I — 1 byte alterado → SHA-256 diverge do original", async () => {
    const code = "TV-TAMPER-0001";
    const digest = await digestFor(code);
    const pdf = await renderOfficialPdfmake(code, digest);
    const hash = await sha256Hex(pdf);
    const tampered = new Uint8Array(pdf);
    tampered[tampered.length - 3] ^= 0x01;
    expect(await sha256Hex(tampered)).not.toBe(hash);
    expect(await pdfContainsBindingMarkers(tampered, code, digest)).toBe(true);
  });
});

describe("P.2 — content digest", () => {
  it("digest depende do snapshot", async () => {
    const d1 = await digestFor("TV-AAAA-BBBB-CCCC");
    const d2 = await digestFor("TV-DDDD-EEEE-FFFF");
    expect(d1).not.toBe(d2);
    expect(d1).toBe(await digestFor("TV-AAAA-BBBB-CCCC"));
  });
});

describe("P.2 — validate-report (contrato SHA-256 do arquivo)", () => {
  it("PDF substituído → hash diverge", async () => {
    const a = await minimalPdfWithText("doc A");
    const b = await minimalPdfWithText("doc B totalmente diferente");
    expect(await sha256Hex(a)).not.toBe(await sha256Hex(b));
  });
});
