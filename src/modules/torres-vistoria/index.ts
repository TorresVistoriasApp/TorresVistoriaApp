/**
 * Rotas ficam fora: `routes.tsx` tem import() no topo e puxaria o módulo
 * inteiro para o chunk de quem importasse este barrel.
 */

export { InspectionTypesSection } from "@/modules/torres-vistoria/components/settings/inspection-types-section";

export {
  formatServicePrice,
  type PlatformService,
} from "@/modules/torres-vistoria/services/platform-service-service";

export { usePlatformServices } from "@/modules/torres-vistoria/hooks/use-platform-services";

export {
  ChecklistStatus,
  InspectionStatus,
  InspectionOpinion,
} from "@/modules/torres-vistoria/domain/enums";

export { getChecklistStatusLabel } from "@/modules/torres-vistoria/domain/checklist/checklist-status";
