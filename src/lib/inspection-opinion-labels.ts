import { ChecklistStatus, InspectionOpinion } from "@/lib/enums";
import { getChecklistStatusLabel } from "@/lib/checklist-status";

/** Rótulos do select de parecer no formulário da vistoria. */
export const INSPECTION_OPINION_FORM_LABELS: Record<InspectionOpinion, string> = {
  [InspectionOpinion.APROVADO]: "Aprovado",
  [InspectionOpinion.APROVADO_COM_OBSERVACOES]: "Aprovado com observações",
  [InspectionOpinion.REPROVADO]: "Reprovado",
};

const OPINION_TO_CHECKLIST_STATUS: Partial<Record<InspectionOpinion, ChecklistStatus>> = {
  [InspectionOpinion.APROVADO]: ChecklistStatus.CONFORME,
  [InspectionOpinion.APROVADO_COM_OBSERVACOES]: ChecklistStatus.NAO_CONFORME,
};

const LEGACY_OPINION_TO_CHECKLIST: Record<string, ChecklistStatus> = {
  CONFORME: ChecklistStatus.CONFORME,
  "CONFORME COM APONTAMENTO": ChecklistStatus.NAO_CONFORME,
};

/** Rótulo do parecer no laudo PDF, alinhado ao checklist. */
export function getInspectionOpinionLabel(opinion: string | null | undefined): string {
  if (!opinion) return "Pendente";

  if (opinion === InspectionOpinion.REPROVADO || opinion.toUpperCase() === "REPROVADO") {
    return "Reprovado";
  }

  const checklistStatus =
    OPINION_TO_CHECKLIST_STATUS[opinion as InspectionOpinion] ??
    LEGACY_OPINION_TO_CHECKLIST[opinion.toUpperCase()];

  if (checklistStatus) {
    return getChecklistStatusLabel(checklistStatus);
  }

  return opinion.replace(/_/g, " ");
}

export function isOpinionWithObservations(label: string): boolean {
  const normalized = label.toUpperCase();
  return normalized.includes("OBSERVA") || normalized.includes("APONTAMENTO");
}

export function isOpinionReproved(label: string): boolean {
  return label.toUpperCase().includes("REPROVADO");
}
