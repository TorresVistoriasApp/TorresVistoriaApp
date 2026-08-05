import type { QueryClient } from "@tanstack/react-query";
import type { CacheKey } from "@/core/cache/cache-keys";

/**
 * Fachada sobre o React Query Client.
 *
 * O client é injetado (não importado de `infra`) para o núcleo não depender
 * da infraestrutura. O bootstrap da app chama `bindCacheClient`.
 */
let boundClient: QueryClient | null = null;

export function bindCacheClient(client: QueryClient): void {
  boundClient = client;
}

function resolveClient(client?: QueryClient): QueryClient {
  const resolved = client ?? boundClient;
  if (!resolved) {
    throw new Error(
      "CacheService sem QueryClient. Chame bindCacheClient(queryClient) no bootstrap.",
    );
  }
  return resolved;
}

export function createCacheService(client?: QueryClient) {
  const qc = () => resolveClient(client);

  return {
    get<T>(key: CacheKey): T | undefined {
      return qc().getQueryData<T>(key);
    },

    set<T>(key: CacheKey, value: T): void {
      qc().setQueryData(key, value);
    },

    async invalidate(key: CacheKey): Promise<void> {
      await qc().invalidateQueries({ queryKey: key });
    },

    async invalidatePrefix(prefix: CacheKey): Promise<void> {
      await qc().invalidateQueries({ queryKey: prefix });
    },

    remove(key: CacheKey): void {
      qc().removeQueries({ queryKey: key });
    },

    clear(): void {
      qc().clear();
    },
  };
}

export type CacheService = ReturnType<typeof createCacheService>;

/** Instância padrão; exige `bindCacheClient` antes do primeiro uso sem client. */
export const cacheService = createCacheService();
