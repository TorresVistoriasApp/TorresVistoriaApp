import { isProduction } from "@/config/env";
import { logger } from "@/core/observability/logger";

type TelemetryProps = Record<string, string | number | boolean | null | undefined>;

/**
 * Telemetria de produto (eventos de uso).
 *
 * Stub: em dev loga; em produção é no-op até um provider (Segment, PostHog…)
 * ser registrado. A assinatura permanece estável.
 */
export function track(event: string, props?: TelemetryProps): void {
  if (!isProduction()) {
    logger.debug(`[telemetry] ${event}`, props);
  }
}

export const telemetry = { track };
