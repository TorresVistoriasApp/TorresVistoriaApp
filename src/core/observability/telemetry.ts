import { isProduction } from "@/config/env";
import { logger } from "@/core/observability/logger";

type TelemetryProps = Record<string, string | number | boolean | null | undefined>;

/** Eventos de produto. Em produção é no-op até haver provider. */
export function track(event: string, props?: TelemetryProps): void {
  if (!isProduction()) {
    logger.debug(`[telemetry] ${event}`, props);
  }
}

export const telemetry = { track };
