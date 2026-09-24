/**
 * Espelho Node dos utilitários em supabase/functions/_shared (testes P.2).
 * Manter alinhado com laudo-content-digest.ts e report-issue-token.ts.
 */
export type ChecklistDigestRow = {
  id: string;
  category: string;
  item_name: string;
  status: string;
  notes: string | null;
};

export async function sha256Hex(data: ArrayBuffer | string): Promise<string> {
  const buffer = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function buildLaudoContentDigest(input: {
  inspection: {
    id: string;
    tenant_id: string;
    updated_at?: string | null;
    inspection_number: number;
    inspection_date: string;
    plate: string | null;
    chassis: string | null;
    renavam?: string | null;
    brand?: string | null;
    model?: string | null;
    opinion?: string | null;
    technical_notes?: string | null;
  };
  checklist: ChecklistDigestRow[];
  photoCount: number;
  verificationCode: string;
  nextVersion: number;
}): Promise<string> {
  const checklistCanon = [...input.checklist]
    .sort((a, b) => `${a.category}:${a.item_name}`.localeCompare(`${b.category}:${b.item_name}`))
    .map((row) => ({
      id: row.id,
      category: row.category,
      item_name: row.item_name,
      status: row.status,
      notes: row.notes ?? "",
    }));

  const payload = {
    inspectionId: input.inspection.id,
    tenantId: input.inspection.tenant_id,
    updatedAt: input.inspection.updated_at ?? null,
    verificationCode: input.verificationCode,
    nextVersion: input.nextVersion,
    photoCount: input.photoCount,
    inspection: {
      inspection_number: input.inspection.inspection_number,
      inspection_date: input.inspection.inspection_date,
      plate: input.inspection.plate,
      chassis: input.inspection.chassis,
      renavam: input.inspection.renavam,
      brand: input.inspection.brand,
      model: input.inspection.model,
      opinion: input.inspection.opinion,
      technical_notes: input.inspection.technical_notes,
    },
    checklist: checklistCanon,
  };

  return sha256Hex(JSON.stringify(payload));
}

export { pdfContainsBindingMarkers } from "@/shared/lib/pdf-binding-markers";

export type ReportIssueTokenPayload = {
  inspectionId: string;
  tenantId: string;
  verificationCode: string;
  contentDigest: string;
  nextVersion: number;
  expMs: number;
};

function testSigningSecret(): string {
  return process.env.LAUDO_TEST_HMAC_SECRET ?? "test-hmac-secret-for-p2-local-only-32chars";
}

async function hmacSign(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(testSigningSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function signReportIssueToken(payload: ReportIssueTokenPayload): Promise<string> {
  const body = JSON.stringify(payload);
  const signature = await hmacSign(body);
  return `${Buffer.from(body, "utf8").toString("base64")}.${signature}`;
}

export async function verifyReportIssueToken(token: string): Promise<ReportIssueTokenPayload> {
  const trimmed = token.trim();
  const dot = trimmed.lastIndexOf(".");
  if (dot <= 0) throw new Error("Token de emissão inválido.");
  const encoded = trimmed.slice(0, dot);
  const signature = trimmed.slice(dot + 1);
  const jsonBody = Buffer.from(encoded, "base64").toString("utf8");
  const expected = await hmacSign(jsonBody);
  if (signature !== expected) throw new Error("Token de emissão inválido.");
  const payload = JSON.parse(jsonBody) as ReportIssueTokenPayload;
  if (!payload.expMs || Date.now() > payload.expMs) {
    throw new Error("Token de emissão expirado. Gere o laudo novamente.");
  }
  return payload;
}
