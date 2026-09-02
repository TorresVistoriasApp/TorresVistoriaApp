import { queryClient } from "@/infra/query/query-client";
import { clearSignedUrlCache } from "@/infra/storage/signed-url";
import { runSessionCleanup } from "@/core/auth/session-cleanup";

/**
 * Limpa caches de sessão após o Auth encerrar o JWT.
 * Inclui URLs assinadas (memória + Cache Storage do SW) e dados de produto.
 */
export async function finalizeSession(): Promise<void> {
  await clearSignedUrlCache();
  await runSessionCleanup();
  queryClient.clear();
}
