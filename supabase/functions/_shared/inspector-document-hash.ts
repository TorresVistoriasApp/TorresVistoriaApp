/**
 * Hash de documento para casar inspector_registrations.document_hash com CNPJ da empresa.
 * Manter alinhado com src/core/auth/inspector-document-hash.ts (HMAC + SHA-256 legado).
 */
export function indexInspectorDocumentHashes<T>(
  target: Map<string, T>,
  value: T,
  hashes: Array<string | null | undefined>,
): void {
  for (const hash of hashes) {
    if (hash) target.set(hash, value);
  }
}

/** Cadastro pendente visível ao SUPER_ADMIN só se o CNPJ bater com a empresa do JWT. */
export function pendingRegistrationMatchesLockedTenant(
  registration: { document_type?: string | null; document_hash?: string | null },
  allowedHashes: ReadonlySet<string>,
): boolean {
  if (allowedHashes.size === 0) return false;
  if (registration.document_type !== "cnpj") return false;
  const hash = registration.document_hash?.trim();
  if (!hash) return false;
  return allowedHashes.has(hash);
}

export async function legacySha256DocumentHex(digits: string): Promise<string> {
  const data = new TextEncoder().encode(digits);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hmacInspectorDocument(
  supabase: { rpc: (fn: string, args: { p_digits: string }) => Promise<{ data: unknown; error: { message?: string } | null }> },
  digits: string,
): Promise<string> {
  const { data, error } = await supabase.rpc("hmac_inspector_document", { p_digits: digits });
  if (error || typeof data !== "string" || !data) {
    throw new Error(error?.message ?? "Não foi possível calcular o HMAC do documento.");
  }
  return data;
}
