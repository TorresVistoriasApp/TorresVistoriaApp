import { isProduction } from "@/config/env";
import { logger } from "@/core/observability/logger";

type MetricTags = Record<string, string | number | boolean | undefined>;

/**
 * Métricas operacionais (contadores / timings).
 *
 * Stub pronto para um backend (Datadog, OTel). Não lança e não bloqueia.
 */
export function increment(name: string, value = 1, tags?: MetricTags): void {
  if (!isProduction()) {
    logger.debug(`[metrics] increment ${name}=${value}`, tags);
  }
}

export function timing(name: string, durationMs: number, tags?: MetricTags): void {
  if (!isProduction()) {
    logger.debug(`[metrics] timing ${name}=${durationMs}ms`, tags);
  }
}

export const metrics = { increment, timing };
