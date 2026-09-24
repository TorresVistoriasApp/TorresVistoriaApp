import { describe, expect, it } from "vitest";
import { buildTorresPdfBindingKeywords, pdfContainsBindingMarkers } from "@/shared/lib/pdf-binding-markers";

const CODE = "TV-ABCD-EFGH-IJKL";
const DIGEST = "f".repeat(64);

function pdfWithLiteralLine(...lines: string[]): Uint8Array {
  const body = lines.join("\n");
  return new TextEncoder().encode(`%PDF-1.4\n${body}\n%%EOF\n`);
}

describe("pdf-binding-markers — linha canônica", () => {
  it("1. código e digest válidos → formato exato sem espaços", () => {
    const line = buildTorresPdfBindingKeywords(CODE, DIGEST);
    expect(line).toBe(`TORRES_BINDING_V1|vc=${CODE}|cd=${DIGEST}`);
    expect(line).not.toMatch(/\s/);
    expect(line.length).toBe("TORRES_BINDING_V1|vc=".length + CODE.length + "|cd=".length + DIGEST.length);
  });

  it("2. binding reconhecido com linha válida embutida", async () => {
    const line = buildTorresPdfBindingKeywords(CODE, DIGEST);
    const pdf = pdfWithLiteralLine(line);
    expect(await pdfContainsBindingMarkers(pdf, CODE, DIGEST)).toBe(true);
  });

  it("3. código alterado na validação → false", async () => {
    const line = buildTorresPdfBindingKeywords(CODE, DIGEST);
    const pdf = pdfWithLiteralLine(line);
    expect(await pdfContainsBindingMarkers(pdf, "TV-WRNG-CODE-XXXX", DIGEST)).toBe(false);
  });

  it("4. digest alterado na validação → false", async () => {
    const line = buildTorresPdfBindingKeywords(CODE, DIGEST);
    const pdf = pdfWithLiteralLine(line);
    expect(await pdfContainsBindingMarkers(pdf, CODE, `${DIGEST}x`)).toBe(false);
  });

  it("5. linha alterada no PDF → false", async () => {
    const line = buildTorresPdfBindingKeywords(CODE, DIGEST).replace("cd=", "cx=");
    const pdf = pdfWithLiteralLine(line);
    expect(await pdfContainsBindingMarkers(pdf, CODE, DIGEST)).toBe(false);
  });

  it("6. binding duplicado no PDF → true (linha canônica presente)", async () => {
    const line = buildTorresPdfBindingKeywords(CODE, DIGEST);
    const pdf = pdfWithLiteralLine(line, line);
    expect(await pdfContainsBindingMarkers(pdf, CODE, DIGEST)).toBe(true);
  });

  it("7. binding truncado → false", async () => {
    const line = buildTorresPdfBindingKeywords(CODE, DIGEST).slice(0, -8);
    const pdf = pdfWithLiteralLine(line);
    expect(await pdfContainsBindingMarkers(pdf, CODE, DIGEST)).toBe(false);
  });

  it("8. binding com sufixo extra na mesma substring não confunde (prefixo falso)", async () => {
    const line = `${buildTorresPdfBindingKeywords(CODE, DIGEST)}EXTRA`;
    const pdf = pdfWithLiteralLine(line);
    expect(await pdfContainsBindingMarkers(pdf, CODE, DIGEST)).toBe(true);
  });

  it("8b. caracteres extras antes da linha ainda permitem match da linha exata", async () => {
    const line = buildTorresPdfBindingKeywords(CODE, DIGEST);
    const pdf = pdfWithLiteralLine(`noise ${line} noise`);
    expect(await pdfContainsBindingMarkers(pdf, CODE, DIGEST)).toBe(true);
  });

  it("9. versão diferente (TORRES_BINDING_V2) → false", async () => {
    const fake = `TORRES_BINDING_V2|vc=${CODE}|cd=${DIGEST}`;
    const pdf = pdfWithLiteralLine(fake);
    expect(await pdfContainsBindingMarkers(pdf, CODE, DIGEST)).toBe(false);
  });

  it("rejeita verificationCode ou digest vazios", async () => {
    const line = buildTorresPdfBindingKeywords(CODE, DIGEST);
    const pdf = pdfWithLiteralLine(line);
    expect(await pdfContainsBindingMarkers(pdf, "", DIGEST)).toBe(false);
    expect(await pdfContainsBindingMarkers(pdf, CODE, "")).toBe(false);
  });
});
