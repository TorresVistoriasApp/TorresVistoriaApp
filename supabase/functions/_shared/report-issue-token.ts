import { sha256Hex } from "./verification-code.ts";

export type ReportIssueTokenPayload = {
  inspectionId: string;
  tenantId: string;
  verificationCode: string;
  contentDigest: string;
  nextVersion: number;
  expMs: number;
};

const ISSUE_TTL_MS = 20 * 60 * 1000;

function signingSecret(): string {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!secret) throw new Error("Configuração do servidor incompleta para emissão de laudo.");
  return secret;
}

async function hmacSign(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signingSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function issueTokenExpiresAt(): number {
  return Date.now() + ISSUE_TTL_MS;
}

export async function signReportIssueToken(payload: ReportIssueTokenPayload): Promise<string> {
  const body = JSON.stringify(payload);
  const signature = await hmacSign(body);
  return `${btoa(body)}.${signature}`;
}

export async function verifyReportIssueToken(token: string): Promise<ReportIssueTokenPayload> {
  const trimmed = token.trim();
  const dot = trimmed.lastIndexOf(".");
  if (dot <= 0) throw new Error("Token de emissão inválido.");
  const encoded = trimmed.slice(0, dot);
  const signature = trimmed.slice(dot + 1);
  const jsonBody = atob(encoded);
  const expected = await hmacSign(jsonBody);
  if (signature !== expected) throw new Error("Token de emissão inválido.");
  const payload = JSON.parse(atob(body)) as ReportIssueTokenPayload;
  if (!payload.expMs || Date.now() > payload.expMs) {
    throw new Error("Token de emissão expirado. Gere o laudo novamente.");
  }
  return payload;
}

export async function fingerprintIssueToken(token: string): Promise<string> {
  return sha256Hex(token);
}
