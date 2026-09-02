/**
 * Rotas ficam fora: `routes.tsx` tem import() no topo e puxaria o módulo
 * inteiro para o chunk de quem importasse este barrel.
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
