import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { optimizePdfBlob } from "@/lib/optimize-pdf";

describe("optimizePdfBlob", () => {
  it("remove metadados identificáveis e preserva o número de páginas", async () => {
    const source = await PDFDocument.create();
    source.addPage();
    source.addPage();
    source.setTitle("Laudo confidencial");
    source.setAuthor("Torres App");
    source.setSubject("Metadado de teste");
    source.setKeywords(["vistoria", "placa"]);
    source.setProducer("pdfmake");
    source.setCreator("test-suite");

    const raw = await source.save();
    const optimized = await optimizePdfBlob(new Blob([raw], { type: "application/pdf" }));
    const result = await PDFDocument.load(await optimized.arrayBuffer());

    expect(result.getPageCount()).toBe(2);
    expect(result.getTitle() || "").toBe("");
    expect(result.getAuthor() || "").toBe("");
    expect(result.getSubject() || "").toBe("");
    expect(result.getCreator()).not.toBe("test-suite");
    expect(result.getProducer()).not.toBe("pdfmake");

    const keywords = result.getKeywords();
    const keywordText = Array.isArray(keywords) ? keywords.join(",") : String(keywords ?? "");
    expect(keywordText).not.toContain("vistoria");
    expect(keywordText).not.toContain("placa");
  });
});
