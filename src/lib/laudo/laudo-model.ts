import type { ChecklistItem } from "@/services/checklist-service";
import type { Inspection } from "@/services/inspection-service";
import type { InspectionPhoto } from "@/services/photo-service";
import { ChecklistStatus } from "@/lib/enums";
import { getInspectionOpinionLabel } from "@/lib/inspection-opinion-labels";

export type LaudoCompany = {
  name?: string | null;
  document?: string | null;
  phone?: string | null;
  email?: string | null;
  logo_url?: string | null;
  address?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
};

export type LaudoSettings = {
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
  /** Número sequencial legível no PDF (TV-2026-000148). */
  laudoNumber: string;
  /** Código opaco usado no QR e na URL /validar. */
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
  return getInspectionOpinionLabel(opinion);
}

export function getLaudoLegalFooter(settings?: LaudoSettings | null): string {
  return (
    settings?.legal_footer?.trim() ||
    "A vistoria cautelar ora apresentada foi realizada por vistoriador habilitado, com análise visual, documental e fotográfica do veículo no momento da inspeção. Este laudo não substitui perícia oficial criminal ou laudo emitido por órgão público competente. As informações são válidas para a data e horário da vistoria, podendo sofrer alteração posterior por intervenção, uso, reparo, sinistro, restrição administrativa ou atualização de bases públicas e privadas."
  );
}

export function getPrimaryColor(company?: LaudoCompany | null): string {
  return company?.primary_color || "#ea580c";
}

