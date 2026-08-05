import { VehicleQueryType } from "@/core/integrations/ports/vehicle-lookup";

/**
 * Catálogo comercial das consultas.
 *
 * Preço em créditos e texto de vitrine vivem aqui, separados do contrato técnico
 * em `@/core/integrations/ports/vehicle-lookup`: o provedor define o que é
 * possível apurar, o catálogo define o que a Torres vende e por quanto.
 */
export interface QueryTypeDefinition {
  type: VehicleQueryType;
  label: string;
  description: string;
  /** Custo em créditos. Fonte de verdade da precificação no frontend. */
  credits: number;
  /** Destaca a opção recomendada na vitrine. */
  highlighted?: boolean;
}

export const QUERY_CATALOG: readonly QueryTypeDefinition[] = [
  {
    type: VehicleQueryType.BASIC,
    label: "Dados cadastrais",
    description: "Marca, modelo, ano, cor, combustível e município de emplacamento.",
    credits: 1,
  },
  {
    type: VehicleQueryType.THEFT,
    label: "Roubo e furto",
    description: "Registro de ocorrência de roubo ou furto nas bases policiais.",
    credits: 2,
  },
  {
    type: VehicleQueryType.LIEN,
    label: "Gravame",
    description: "Restrição financeira, alienação fiduciária e agente credor.",
    credits: 2,
  },
  {
    type: VehicleQueryType.DEBTS,
    label: "Débitos e multas",
    description: "IPVA, licenciamento, multas e restrições administrativas.",
    credits: 3,
  },
  {
    type: VehicleQueryType.AUCTION,
    label: "Histórico de leilão",
    description: "Passagem por leilão, classificação do lote e comitente.",
    credits: 3,
  },
  {
    type: VehicleQueryType.CLAIMS,
    label: "Sinistro",
    description: "Indenização integral, perda total e histórico de sinistro.",
    credits: 3,
  },
  {
    type: VehicleQueryType.COMPLETE,
    label: "Consulta completa",
    description: "Todas as fontes acima consolidadas em um laudo único.",
    credits: 10,
    highlighted: true,
  },
];

const BY_TYPE = new Map(QUERY_CATALOG.map((item) => [item.type, item]));

export function getQueryDefinition(type: VehicleQueryType): QueryTypeDefinition {
  const definition = BY_TYPE.get(type);
  if (!definition) throw new Error(`Tipo de consulta desconhecido: ${type}`);
  return definition;
}

export function getQueryCost(type: VehicleQueryType): number {
  return getQueryDefinition(type).credits;
}

export function getQueryLabel(type: VehicleQueryType): string {
  return BY_TYPE.get(type)?.label ?? type;
}
