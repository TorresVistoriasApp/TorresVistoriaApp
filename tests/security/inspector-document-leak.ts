/**
 * Varre artefatos de Auth/Edge em busca do documento original do vistoriador.
 * Usado pelos testes obrigatórios de vazamento pós-cadastro.
 */
export function findInspectorDocumentLeaks(
  documentDigits: string,
  artifacts: Record<string, unknown>,
): string[] {
  const digits = documentDigits.replace(/\D/g, "");
  if (digits.length < 11) {
    throw new Error("findInspectorDocumentLeaks exige o documento completo (CPF/CNPJ).");
  }

  const leaks: string[] = [];
  const variants = new Set<string>([
    digits,
    digits.toLowerCase(),
    Buffer.from(digits, "utf8").toString("base64"),
    Buffer.from(digits, "utf8").toString("base64url"),
  ]);

  function visit(value: unknown, path: string): void {
    if (value == null) return;

    if (typeof value === "string") {
      const compact = value.replace(/\s/g, "");
      for (const variant of variants) {
        if (compact.includes(variant) || value.includes(variant)) {
          leaks.push(path);
          return;
        }
      }
      const jwtParts = value.split(".");
      if (jwtParts.length === 3) {
        try {
          const payload = JSON.parse(Buffer.from(jwtParts[1], "base64url").toString("utf8"));
          visit(payload, `${path}[jwt.payload]`);
        } catch {
          // refresh tokens e strings opacas não são JWT
        }
      }
      return;
    }

    if (typeof value === "number" || typeof value === "boolean") return;

    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}[${index}]`));
      return;
    }

    if (typeof value === "object") {
      for (const [key, nested] of Object.entries(value)) {
        visit(nested, path ? `${path}.${key}` : key);
      }
    }
  }

  visit(artifacts, "");
  return [...new Set(leaks)];
}

export function encodeUnsignedJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.unsigned`;
}
