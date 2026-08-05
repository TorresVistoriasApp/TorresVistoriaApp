/** Identidade e defaults da aplicação. Sem dependências de domínio. */

export const APP_NAME = "Torres Vistoria";
export const APP_VERSION = "0.1.0";
export const DEFAULT_PRIMARY_COLOR = "#ea580c";
export const DEFAULT_COMPANY_ID = "00000000-0000-4000-8000-000000000001";

/** Ecossistema Torres: produtos que compõem a plataforma. */
export const PRODUCTS = {
  vistoria: {
    id: "torres-vistoria",
    name: "Torres Vistoria",
    description: "Vistoria cautelar veicular com laudo digital",
  },
  consulta: {
    id: "torres-consulta",
    name: "Torres Consulta",
    description: "Consulta veicular sob demanda",
  },
} as const;

export type ProductId = (typeof PRODUCTS)[keyof typeof PRODUCTS]["id"];
