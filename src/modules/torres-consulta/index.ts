/**
 * API pública do módulo Torres Consulta.
 *
 * Outros módulos consomem apenas o que está exportado aqui; alcançar arquivos
 * internos é o que transforma módulos em um monólito acoplado.
 *
 * As rotas não entram no barrel: elas registram `import()` preguiçosos no topo
 * do arquivo e arrastariam o módulo inteiro para o chunk de quem importar.
 * O roteador usa `@/modules/torres-consulta/routes`.
 */

export {
  consultaService,
  isConsultaAvailable,
  missingIntegrations,
  ConsultaUnavailableReason,
  requestConsulta,
  listConsultas,
  getConsulta,
  getCreditBalance,
} from "@/modules/torres-consulta/services/consulta-service";

export {
  QUERY_CATALOG,
  getQueryCost,
  getQueryLabel,
  getQueryDefinition,
  type QueryTypeDefinition,
} from "@/modules/torres-consulta/domain/query-catalog";

export {
  ConsultaStatus,
  type Consulta,
  type ConsultaFilters,
} from "@/modules/torres-consulta/domain/entities/consulta";

export {
  type ConsultaRepository,
  setConsultaRepository,
  createInMemoryConsultaRepository,
} from "@/modules/torres-consulta/repositories/consulta-repository";

export {
  isValidPlate,
  isValidChassis,
  formatPlate,
  normalizePlate,
  normalizeChassis,
} from "@/modules/torres-consulta/domain/value-objects";

export { ConsultaDomainEvents } from "@/modules/torres-consulta/domain/events/consulta-events";
