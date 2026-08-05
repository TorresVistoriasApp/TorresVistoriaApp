/**
 * Fachada estável do módulo.
 *
 * A orquestração mora em `application/use-cases`. Este arquivo existe para não
 * quebrar importadores que ainda apontam para `consultaService`.
 */

export {
  isConsultaAvailable,
  missingIntegrations,
  ConsultaUnavailableReason,
} from "@/modules/torres-consulta/domain/services/consulta-availability";

export {
  requestConsulta,
  listConsultas,
  getConsulta,
  getCreditBalance,
} from "@/modules/torres-consulta/application/use-cases";

import {
  getConsulta,
  listConsultas,
  requestConsulta,
} from "@/modules/torres-consulta/application/use-cases";

export const consultaService = {
  list: listConsultas,
  getById: getConsulta,
  request: requestConsulta,
};
