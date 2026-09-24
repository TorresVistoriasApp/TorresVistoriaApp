import { describe, expect, it, beforeAll } from "vitest";
import sharp from "sharp";
import { buildLaudoDocDefinition } from "@/modules/torres-vistoria/domain/laudo/laudo-doc-definition";
import { buildLaudoPayloadFixture } from "../../../../helpers/laudo-payload-fixture";
import {
  analyzePdfBytes,
  base64ByteLength,
  estimateSealRequestBytes,
  renderLaudoPdfBytes,
} from "../../../../helpers/laudo-pdf-render";

const VOLUMES = [1, 10, 50, 75, 80, 100] as const;
const MAX_SEAL_BYTES = 40 * 1024 * 1024;

type BenchRow = {
  photos: number;
  pages: number;
  pdfBytes: number;
  pdfMb: number;
  base64Mb: number;
  requestMb: number;
  ms: number;
  imagesInPdf: number;
  ok: boolean;
  under40Mb: boolean;
};

let photoDataUrl = "";

function collectSectionTitles(def: Record<string, unknown>): string[] {
  const titles: string[] = [];
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    const record = node as Record<string, unknown>;
    if (typeof record.title === "string") titles.push(record.title);
    for (const value of Object.values(record)) walk(value);
  };
  walk(def.content);
  return titles;
}

describe("P.2 — geração real de PDF (pdfmake)", () => {
  beforeAll(async () => {
    const jpeg = await sharp({
      create: { width: 560, height: 420, channels: 3, background: { r: 180, g: 190, b: 200 } },
    })
      .jpeg({ quality: 72 })
      .toBuffer();
    photoDataUrl = `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  }, 60_000);

  const results: BenchRow[] = [];

  for (const count of VOLUMES) {
    it(`gera PDF real com ${count} fotos`, async () => {
      const payload = buildLaudoPayloadFixture(count, photoDataUrl, {
        contentDigest: `digest-p2-${count}-${"b".repeat(48)}`,
      });
      const started = performance.now();
      const bytes = await renderLaudoPdfBytes(payload, { preview: false });
      const ms = performance.now() - started;
      const analysis = await analyzePdfBytes(bytes);

      expect(analysis.isPdfHeader).toBe(true);
      expect(bytes.length).toBeGreaterThan(1000);
      expect(analysis.pageCount).toBeGreaterThan(0);
      expect(analysis.imageObjectCount).toBeGreaterThan(0);

      const pdfMb = bytes.length / (1024 * 1024);
      const base64Mb = base64ByteLength(bytes.length) / (1024 * 1024);
      const requestMb = estimateSealRequestBytes(bytes.length) / (1024 * 1024);

      results.push({
        photos: count,
        pages: analysis.pageCount,
        pdfBytes: bytes.length,
        pdfMb: Number(pdfMb.toFixed(2)),
        base64Mb: Number(base64Mb.toFixed(2)),
        requestMb: Number(requestMb.toFixed(2)),
        ms: Math.round(ms),
        imagesInPdf: analysis.imageObjectCount,
        ok: true,
        under40Mb: bytes.length <= MAX_SEAL_BYTES,
      });
    }, 300_000);
  }

  it("registra tabela de benchmark no stdout", () => {
    console.table(results);
    expect(results).toHaveLength(VOLUMES.length);
    for (const row of results) {
      expect(row.ok).toBe(true);
    }
  });

  it("75 e 100 fotos geram PDF com imagens (layout deduplica por categoria)", () => {
    const row75 = results.find((row) => row.photos === 75);
    const row100 = results.find((row) => row.photos === 100);
    expect(row75?.imagesInPdf).toBeGreaterThanOrEqual(1);
    expect(row100?.imagesInPdf).toBeGreaterThanOrEqual(1);
    expect(row75?.pages).toBeGreaterThan(5);
    expect(row100?.pages).toBeGreaterThan(5);
  });

  it("preview e official têm mesma estrutura de seções (exceto metadados)", async () => {
    const payload = buildLaudoPayloadFixture(10, photoDataUrl);
    const previewDef = buildLaudoDocDefinition({
      ...payload,
      verificationCode: "PREVIA-NAO-OFICIAL",
      integrityHash: "preview",
    }) as Record<string, unknown>;
    previewDef.watermark = { text: "PREVIA — NAO OFICIAL" };

    const officialDef = buildLaudoDocDefinition({
      ...payload,
      verificationCode: "TV-ABCD-EFGH-IJKL",
      contentDigest: "c".repeat(64),
      integrityHash: "c".repeat(64),
    }) as Record<string, unknown>;

    const previewTitles = collectSectionTitles(previewDef).sort();
    const officialTitles = collectSectionTitles(officialDef).sort();
    expect(previewTitles).toEqual(officialTitles);

    const [previewBytes, officialBytes] = await Promise.all([
      renderLaudoPdfBytes({ ...payload, verificationCode: "PREVIA-NAO-OFICIAL", integrityHash: "preview" }, {
        preview: true,
      }),
      renderLaudoPdfBytes({
        ...payload,
        verificationCode: "TV-ABCD-EFGH-IJKL",
        contentDigest: "c".repeat(64),
        integrityHash: "c".repeat(64),
      }),
    ]);

    expect(previewDef.watermark).toBeDefined();
    expect(officialDef.watermark).toBeUndefined();
    const previewAnalysis = await analyzePdfBytes(previewBytes);
    const officialAnalysis = await analyzePdfBytes(officialBytes);
    expect(previewAnalysis.pageCount).toBe(officialAnalysis.pageCount);
    expect(previewAnalysis.isPdfHeader).toBe(true);
  }, 120_000);
});
