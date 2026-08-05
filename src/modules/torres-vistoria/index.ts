/**
 * API pública do módulo Torres Vistoria.
 *
 * Só o que aparece aqui pode ser consumido de fora do módulo. Alcançar arquivos
 * internos congela decisões de implementação como se fossem contrato.
 */

export { torresVistoriaRoutes } from "@/modules/torres-vistoria/routes";

export { InspectionTypesSection } from "@/modules/torres-vistoria/components/settings/inspection-types-section";

export {
  ChecklistStatus,
  InspectionStatus,
  InspectionOpinion,
} from "@/modules/torres-vistoria/domain/enums";

export { getChecklistStatusLabel } from "@/modules/torres-vistoria/domain/checklist/checklist-status";
