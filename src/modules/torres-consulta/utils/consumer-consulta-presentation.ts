import { ConsultaStatus } from "@/modules/torres-consulta/domain/entities/consulta";
import type { ConsumerConsulta } from "@/modules/torres-consulta/domain/entities/consumer-consulta";
import { formatDate } from "@/shared/lib/formatters";

export const CONSUMER_CONSULTA_STATUS_LABELS: Record<ConsultaStatus, string> = {
  [ConsultaStatus.PROCESSING]: "Processando",
  [ConsultaStatus.COMPLETED]: "Disponível",
  [ConsultaStatus.FAILED]: "Falhou",
};

export function getConsumerConsultaStatusLabel(status: ConsultaStatus): string {
  return CONSUMER_CONSULTA_STATUS_LABELS[status];
}

export function getConsumerConsultaStatusClass(status: ConsultaStatus): string {
  switch (status) {
    case ConsultaStatus.COMPLETED:
      return "bg-emerald-500/10 text-emerald-700";
    case ConsultaStatus.PROCESSING:
      return "bg-amber-500/10 text-amber-700";
    case ConsultaStatus.FAILED:
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-slate-500/10 text-slate-600";
  }
}

export function getConsumerConsultaIdentifier(consulta: ConsumerConsulta): string {
  return consulta.plate ?? consulta.chassis ?? "—";
}

export function formatConsumerConsultaDate(createdAt: string): string {
  return formatDate(createdAt);
}

export function canDownloadConsumerConsulta(consulta: ConsumerConsulta): boolean {
  return consulta.status === ConsultaStatus.COMPLETED && Boolean(consulta.documentUrl);
}
