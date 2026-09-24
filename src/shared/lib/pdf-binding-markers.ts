/**
 * Marcadores de binding PREPARE → PDF → SEAL.
 * Manter em sincronia com `supabase/functions/_shared/pdf-binding-markers.ts`.
 */

export const TORRES_PDF_BINDING_PREFIX = "TORRES_BINDING_V1";

export function buildTorresPdfBindingKeywords(
  verificationCode: string,
  contentDigest: string,
): string {
  return `${TORRES_PDF_BINDING_PREFIX}|vc=${verificationCode}|cd=${contentDigest}`;
}

export function applyTorresOfficialPdfBinding(
  docDefinition: Record<string, unknown>,
  verificationCode: string,
  contentDigest: string,
): void {
  const keywords = buildTorresPdfBindingKeywords(verificationCode, contentDigest);
  const prev = docDefinition.info;
  const info =
    prev && typeof prev === "object" && !Array.isArray(prev)
      ? { ...(prev as Record<string, unknown>) }
      : {};
  info.keywords = keywords;
  docDefinition.info = info;
}

function latin1(bytes: Uint8Array): string {
  return new TextDecoder("latin1").decode(bytes);
}

async function inflateFlateChunk(data: Uint8Array): Promise<Uint8Array | null> {
  if (data.length === 0) return data;
  try {
    const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate"));
    const out = await new Response(stream).arrayBuffer();
    return new Uint8Array(out);
  } catch {
    return null;
  }
}

export async function buildPdfSearchableCorpus(pdfBytes: Uint8Array): Promise<string> {
  const parts: string[] = [latin1(pdfBytes)];
  const raw = latin1(pdfBytes);
  const streamToken = "stream";
  let cursor = 0;
  while (cursor < raw.length) {
    const streamIdx = raw.indexOf(streamToken, cursor);
    if (streamIdx < 0) break;
    const lineStart = streamIdx > 0 && raw[streamIdx - 1] === "\r" ? streamIdx - 1 : streamIdx;
    const dictOpen = raw.lastIndexOf("<<", lineStart);
    if (dictOpen < 0) {
      cursor = streamIdx + streamToken.length;
      continue;
    }
    const dictBody = raw.slice(dictOpen, lineStart);
    if (!dictBody.includes("FlateDecode")) {
      cursor = streamIdx + streamToken.length;
      continue;
    }
    let dataStart = streamIdx + streamToken.length;
    if (raw[dataStart] === "\r") dataStart += 1;
    if (raw[dataStart] === "\n") dataStart += 1;
    const endIdx = raw.indexOf("endstream", dataStart);
    if (endIdx < 0) break;
    let dataEnd = endIdx;
    if (raw[dataEnd - 1] === "\n") dataEnd -= 1;
    if (raw[dataEnd - 1] === "\r") dataEnd -= 1;
    const chunk = pdfBytes.subarray(dataStart, dataEnd);
    const inflated = await inflateFlateChunk(chunk);
    if (inflated) parts.push(latin1(inflated));
    cursor = endIdx + "endstream".length;
  }
  return parts.join("\n");
}

export async function pdfContainsBindingMarkers(
  pdfBytes: Uint8Array,
  verificationCode: string,
  contentDigest: string,
): Promise<boolean> {
  if (!verificationCode || !contentDigest) return false;
  const expectedLine = buildTorresPdfBindingKeywords(verificationCode, contentDigest);
  const latin = latin1(pdfBytes);
  if (latin.includes(expectedLine)) return true;

  const corpus = await buildPdfSearchableCorpus(pdfBytes);
  return corpus.includes(expectedLine);
}
