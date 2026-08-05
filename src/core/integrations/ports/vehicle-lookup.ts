import type { IntegrationContext, IntegrationResult } from "@/core/integrations/ports/shared";

/** Categorias de consulta oferecidas pelo Torres Consulta. */
export const VehicleQueryType = {
  /** Dados cadastrais básicos: marca, modelo, ano, cor, município. */
  BASIC: "BASIC",
  /** Registro de roubo e furto. */
  THEFT: "THEFT",
  /** Histórico de leilão e classificação do lote. */
  AUCTION: "AUCTION",
  /** Débitos, multas, IPVA e licenciamento. */
  DEBTS: "DEBTS",
  /** Histórico de sinistro e indenização integral. */
  CLAIMS: "CLAIMS",
  /** Gravame e restrição financeira. */
  LIEN: "LIEN",
  /** Laudo agregado com todas as fontes acima. */
  COMPLETE: "COMPLETE",
} as const;
export type VehicleQueryType = (typeof VehicleQueryType)[keyof typeof VehicleQueryType];

/** Chave de busca: placa ou chassi, nunca ambos. */
export type VehicleIdentifier = { plate: string } | { chassis: string };

export interface VehicleQueryRequest {
  identifier: VehicleIdentifier;
  type: VehicleQueryType;
}

export interface VehicleSummary {
  plate: string | null;
  chassis: string | null;
  brand: string | null;
  model: string | null;
  modelYear: number | null;
  manufactureYear: number | null;
  color: string | null;
  fuel: string | null;
  city: string | null;
  state: string | null;
}

/** Um achado da consulta. `severity` orienta a apresentação, não a regra. */
export interface VehicleFinding {
  category: VehicleQueryType;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  occurredAt: string | null;
}

export interface VehicleQueryResult {
  id: string;
  type: VehicleQueryType;
  vehicle: VehicleSummary;
  findings: VehicleFinding[];
  /** Documento gerado pelo provedor, quando houver. */
  documentUrl: string | null;
  /** Momento da apuração na fonte — pode ser anterior à requisição. */
  queriedAt: string;
  provider: string;
}

/**
 * Porta de consulta veicular.
 *
 * Cada tipo de consulta tem preço próprio, então o custo é exposto antes da
 * execução: a UI precisa confirmar o débito de créditos com o usuário.
 */
export interface VehicleLookupPort {
  /** Custo em créditos, consultado antes de executar. */
  getQueryCost(type: VehicleQueryType): number;

  query(
    context: IntegrationContext,
    request: VehicleQueryRequest,
  ): Promise<IntegrationResult<VehicleQueryResult>>;

  /** Recupera um resultado já apurado, sem custo adicional. */
  getById(
    context: IntegrationContext,
    queryId: string,
  ): Promise<IntegrationResult<VehicleQueryResult>>;
}
