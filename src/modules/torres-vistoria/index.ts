/**
 * API pública do módulo Torres Vistoria.
 *
 * Só o que aparece aqui pode ser consumido de fora do módulo. Alcançar arquivos
 * internos congela decisões de implementação como se fossem contrato.
 *
 * As rotas ficam de fora de propósito: `routes.tsx` registra os `import()`
 * preguiçosos no topo do arquivo, então exportá-lo aqui faria qualquer consumidor
 * do barrel arrastar o módulo inteiro para o seu chunk. O roteador importa
 * `@/modules/torres-vistoria/routes` diretamente.
 */

export { InspectionTypesSection } from "@/modules/torres-vistoria/components/settings/inspection-types-section";

export {
  ChecklistStatus,
  InspectionStatus,
  InspectionOpinion,
} from "@/modules/torres-vistoria/domain/enums";

export { getChecklistStatusLabel } from "@/modules/torres-vistoria/domain/checklist/checklist-status";
