/**
 * Observabilidade operacional.
 *
 * Distinto de `core/audit`: audit é trilha de conformidade (quem mudou o quê);
 * logger/telemetry/metrics/tracing são sinais de operação e produto.
 */

export { logger } from "@/core/observability/logger";
export { telemetry, track } from "@/core/observability/telemetry";
export { metrics, increment, timing } from "@/core/observability/metrics";
export { tracing, startSpan, withSpan, type Span } from "@/core/observability/tracing";
