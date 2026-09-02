/**
 * Casamento de document_hash de vistoriador.
 * Cadastros novos usam HMAC-SHA256 com pepper no banco; pendências anteriores
 * à Fase A ainda podem ter SHA-256 puro. A Edge de aprovação indexa os dois.
 */
export function inspectorDocumentHashMatches(
  storedHash: string,
  hmacHex: string,
  legacySha256Hex: string,
): boolean {
  return storedHash === hmacHex || storedHash === legacySha256Hex;
}

export function indexInspectorDocumentHashes<T>(
  target: Map<string, T>,
  value: T,
  hashes: Array<string | null | undefined>,
): void {
  for (const hash of hashes) {
    if (hash) target.set(hash, value);
  }
}
