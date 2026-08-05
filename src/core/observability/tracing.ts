import { isProduction } from "@/config/env";
import { logger } from "@/core/observability/logger";

export type Span = {
  name: string;
  end: (error?: unknown) => void;
};

/**
 * Tracing distribuído (stub).
 *
 * `withSpan` mede duração e engole erros de instrumentação — nunca deve
 * alterar o resultado do callback de negócio.
 */
export function startSpan(name: string, attrs?: Record<string, unknown>): Span {
  const started = performance.now();
  let closed = false;
  if (!isProduction()) {
    logger.debug(`[trace] start ${name}`, attrs);
  }
  return {
    name,
    end(error?: unknown) {
      if (closed) return;
      closed = true;
      const durationMs = Math.round(performance.now() - started);
      if (!isProduction()) {
        logger.debug(`[trace] end ${name} (${durationMs}ms)`, error ? { error } : undefined);
      }
    },
  };
}

export async function withSpan<T>(
  name: string,
  fn: () => Promise<T> | T,
  attrs?: Record<string, unknown>,
): Promise<T> {
  const span = startSpan(name, attrs);
  try {
    const result = await fn();
    span.end();
    return result;
  } catch (error) {
    span.end(error);
    throw error;
  }
}

export const tracing = { startSpan, withSpan };
