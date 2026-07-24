import { db } from "@/lib/db-client";

/**
 * Resolução de URLs para buckets privados.
 *
 * Os buckets guardam PII (fotos de veículo e PDFs de laudo), então não podem ser
 * públicos: a rota /object/public/ do Supabase ignora as policies de
 * storage.objects. Como URL assinada expira, ela nunca é persistida no banco —
 * é gerada na leitura a partir do storage_path e mantida em cache enquanto vale.
 */

const DEFAULT_TTL_SECONDS = 60 * 60;

/** Margem para não devolver URL prestes a vencer no meio de um upload de PDF. */
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

type CacheEntry = { url: string; expiresAt: number };

const cache = new Map<string, CacheEntry>();

function cacheKey(bucket: string, path: string): string {
  return `${bucket}:${path}`;
}

function readCache(bucket: string, path: string): string | null {
  const key = cacheKey(bucket, path);
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.expiresAt - REFRESH_MARGIN_MS <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return hit.url;
}

function writeCache(bucket: string, path: string, url: string, ttlSeconds: number): void {
  cache.set(cacheKey(bucket, path), {
    url,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export async function getSignedUrl(
  bucket: string,
  path: string | null | undefined,
  ttlSeconds = DEFAULT_TTL_SECONDS,
): Promise<string | null> {
  if (!path) return null;

  const cached = readCache(bucket, path);
  if (cached) return cached;

  const { data, error } = await db.storage.from(bucket).createSignedUrl(path, ttlSeconds);
  if (error || !data?.signedUrl) return null;

  writeCache(bucket, path, data.signedUrl, ttlSeconds);
  return data.signedUrl;
}

/** Assina vários caminhos numa chamada só — uma vistoria tem dezenas de fotos. */
export async function getSignedUrls(
  bucket: string,
  paths: Array<string | null | undefined>,
  ttlSeconds = DEFAULT_TTL_SECONDS,
): Promise<Map<string, string>> {
  const resolved = new Map<string, string>();
  const pending: string[] = [];

  for (const path of new Set(paths.filter((p): p is string => Boolean(p)))) {
    const cached = readCache(bucket, path);
    if (cached) resolved.set(path, cached);
    else pending.push(path);
  }

  if (pending.length === 0) return resolved;

  const { data, error } = await db.storage.from(bucket).createSignedUrls(pending, ttlSeconds);
  if (error || !data) return resolved;

  for (const item of data) {
    if (item.path && item.signedUrl) {
      writeCache(bucket, item.path, item.signedUrl, ttlSeconds);
      resolved.set(item.path, item.signedUrl);
    }
  }

  return resolved;
}

/** Chamado no logout: as URLs assinadas herdam a sessão de quem as gerou. */
export function clearSignedUrlCache(): void {
  cache.clear();
}
