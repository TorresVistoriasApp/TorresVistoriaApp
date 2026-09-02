import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("Fase D — máscara padrão na UI, valor completo só no documento oficial", () => {
  it("helper de máscara existe com os formatos combinados", () => {
    const pii = readRepo("src/shared/lib/pii.ts");
    expect(pii).toContain("***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**");
    expect(pii).toContain("`**.***.***/${digits.slice(8, 12)}-**`");
    expect(pii).toContain("*****@");
    expect(pii).not.toMatch(/crypto\.subtle\.encrypt/);
  });

  it("telas normais mascaram documento, e-mail e telefone", () => {
    const detail = readRepo("src/modules/torres-vistoria/pages/inspection-detail-page.tsx");
    expect(detail).toContain("redactDocument");
    expect(detail).toContain("redactPhone");
    expect(detail).toContain("redactEmail");
    expect(detail).not.toMatch(/formatDocument\(inspection\.client_document\)/);

    const users = readRepo("src/modules/admin/users/components/user-card.tsx");
    expect(users).toContain("redactEmail");
    expect(users).toContain("redactPhone");

    const registrations = readRepo(
      "src/modules/admin/platform/pages/admin-inspector-registrations-page.tsx",
    );
    expect(registrations).toContain("redactEmail");
    expect(registrations).toContain("document_tail");
  });

  it("PDF/laudo oficial continua com formatDocument (Nível 1)", () => {
    const pdf = readRepo("src/modules/torres-vistoria/domain/laudo/laudo-doc-definition.ts");
    expect(pdf).toContain("formatDocument");
    expect(pdf).not.toContain("redactDocument");
    const rows = readRepo("src/modules/torres-vistoria/domain/laudo/laudo-field-utils.ts");
    expect(rows).toContain("formatDocument");
    expect(rows).not.toContain("redactDocument");
  });

  it("exportação gerencial não inclui CPF/e-mail/telefone", () => {
    const reports = readRepo("src/modules/torres-vistoria/pages/reports-page.tsx");
    expect(reports).not.toContain("client_document");
    expect(reports).not.toContain("client_email");
    expect(reports).not.toContain("client_phone");
  });

  it("auditoria mascara PII e oculta hash/senha", () => {
    const audit = readRepo("src/modules/admin/audit/utils/audit-presentation.ts");
    expect(audit).toContain("redactKnownPiiValue");
    expect(audit).toContain("PII_HIDDEN_FIELDS");
  });

  it("não introduz AES em colunas de documento", () => {
    const src = [
      readRepo("src/shared/lib/pii.ts"),
      readRepo("src/core/observability/logger.ts"),
      readRepo("src/modules/torres-vistoria/repositories/vistoria-mutations.ts"),
    ].join("\n");
    expect(src).not.toMatch(/crypto\.subtle\.encrypt|aes-gcm|AES-GCM/i);
  });
});
