import type { ChecklistItem } from "@/services/checklist-service";
import type { Inspection } from "@/services/inspection-service";
import type { InspectionPhoto } from "@/services/photo-service";
import { ChecklistStatus, InspectionOpinion } from "@/lib/enums";
import { getChecklistStatusLabel } from "@/lib/checklist-status";

export type LaudoCompany = {
  name?: string | null;
  document?: string | null;
  phone?: string | null;
  email?: string | null;
  logo_url?: string | null;
  address?: string | null;
};

export type LaudoSettings = {
  primary_color?: string | null;
  legal_footer?: string | null;
  signature_image_url?: string | null;
  watermark_enabled?: boolean | null;
};

export type LaudoInspector = {
  full_name?: string | null;
  role?: string | null;
  credential?: string | null;
};

export type LaudoPhoto = InspectionPhoto & {
  label?: string;
  dataUrl?: string;
};

export type LaudoPayload = {
  inspection: Inspection;
  checklist: ChecklistItem[];
  photos: LaudoPhoto[];
  company?: LaudoCompany | null;
  settings?: LaudoSettings | null;
  inspector?: LaudoInspector | null;
  verificationCode: string;
  integrityHash: string;
  validationUrl?: string;
  logoDataUrl?: string;
  brandLogoDataUrl?: string;
  generatedAt: Date;
};

export type ChecklistStats = {
  total: number;
  evaluated: number;
  conforme: number;
  naoConforme: number;
  naoAplicavel: number;
  pendente: number;
  riskLevel: "BAIXO" | "MEDIO" | "ALTO";
};

export function summarizeLaudoChecklist(items: ChecklistItem[]): ChecklistStats {
  const total = items.length;
  const conforme = items.filter((item) => item.status === ChecklistStatus.CONFORME).length;
  const naoConforme = items.filter((item) => item.status === ChecklistStatus.NAO_CONFORME).length;
  const naoAplicavel = items.filter((item) => item.status === ChecklistStatus.NA).length;
  const pendente = items.filter((item) => item.status === ChecklistStatus.PENDENTE).length;
  const evaluated = total - pendente;
  const riskLevel = naoConforme >= 4 ? "ALTO" : naoConforme > 0 ? "MEDIO" : "BAIXO";

  return { total, evaluated, conforme, naoConforme, naoAplicavel, pendente, riskLevel };
}

export function getOpinionLabel(opinion: string | null | undefined): string {
  if (!opinion) return "PENDENTE";
  const labels: Record<string, string> = {
    [InspectionOpinion.APROVADO]: getChecklistStatusLabel(ChecklistStatus.CONFORME),
    [InspectionOpinion.APROVADO_COM_OBSERVACOES]: getChecklistStatusLabel(ChecklistStatus.NAO_CONFORME),
    [InspectionOpinion.REPROVADO]: "REPROVADO",
  };
  return labels[opinion] ?? opinion.replace(/_/g, " ");
}

export function getLaudoLegalFooter(settings?: LaudoSettings | null): string {
  return (
    settings?.legal_footer?.trim() ||
    "A vistoria cautelar ora apresentada foi realizada por vistoriador habilitado, com análise visual, documental e fotográfica do veículo no momento da inspeção. Este laudo não substitui perícia oficial criminal ou laudo emitido por órgão público competente. As informações são válidas para a data e horário da vistoria, podendo sofrer alteração posterior por intervenção, uso, reparo, sinistro, restrição administrativa ou atualização de bases públicas e privadas."
  );
}

export function getPrimaryColor(settings?: LaudoSettings | null): string {
  return settings?.primary_color || "#ea580c";
}

