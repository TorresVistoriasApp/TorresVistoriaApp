import { ConsultaStatus } from "@/modules/torres-consulta/domain/entities/consulta";
import type { ConsumerConsulta } from "@/modules/torres-consulta/domain/entities/consumer-consulta";
import { formatDate } from "@/shared/lib/formatters";
import { maskChassisForDisplay } from "@/modules/torres-consulta/domain/value-objects";

export const CONSUMER_CONSULTA_STATUS_LABELS: Record<ConsultaStatus, string> = {
  [ConsultaStatus.PROCESSING]: "Processando",
  [ConsultaStatus.COMPLETED]: "Disponível",
  [ConsultaStatus.FAILED]: "Falhou",
};

export function getConsumerConsultaStatusLabel(status: ConsultaStatus): string {
  return CONSUMER_CONSULTA_STATUS_LABELS[status];
}

/** Chip de status pronto para uso: forma, cor e caixa alta vêm dos tokens. */
export function getConsumerConsultaStatusClass(status: ConsultaStatus): string {
  switch (status) {
    case ConsultaStatus.COMPLETED:
      return "ui-chip-positive uppercase tracking-wide";
    case ConsultaStatus.PROCESSING:
      return "ui-chip-warning uppercase tracking-wide";
    case ConsultaStatus.FAILED:
      return "ui-chip-negative uppercase tracking-wide";
  }
}

export function getConsumerConsultaIdentifier(
  consulta: ConsumerConsulta,
  options?: { revealChassis?: boolean },
): string {
  if (consulta.plate) return consulta.plate;
  if (!consulta.chassis) return "—";
  return options?.revealChassis ? consulta.chassis : maskChassisForDisplay(consulta.chassis);
}

export function formatConsumerConsultaDate(createdAt: string): string {
  return formatDate(createdAt);
}

export function canDownloadConsumerConsulta(consulta: ConsumerConsulta): boolean {
  return consulta.status === ConsultaStatus.COMPLETED && Boolean(consulta.documentUrl);
}
