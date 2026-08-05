import { ROUTES } from "@/config/routes";

export const MARKETING_HEADER_NAV = [
  { label: "Como Funciona", to: ROUTES.comoFunciona },
  { label: "Preços", to: ROUTES.planos },
  { label: "Exemplo de Relatório", to: ROUTES.relatorioExemplo },
] as const;

export const MARKETING_FOOTER = {
  empresa: [
    { label: "Sobre", to: ROUTES.sobre },
    { label: "Contato", to: ROUTES.contato },
    { label: "Ajuda", to: ROUTES.ajuda },
  ],
  produto: [
    { label: "Como Funciona", to: ROUTES.comoFunciona },
    { label: "Planos", to: ROUTES.planos },
    { label: "Relatório Exemplo", to: ROUTES.relatorioExemplo },
  ],
  legal: [
    { label: "LGPD", to: ROUTES.lgpd },
    { label: "Privacidade", to: ROUTES.privacy },
    { label: "Termos", to: ROUTES.termos },
    { label: "Cookies", to: ROUTES.cookies },
  ],
  suporte: [
    { label: "Área do Cliente", to: ROUTES.clienteLogin },
    { label: "Área do Vistoriador", to: ROUTES.vistoriaLogin },
  ],
} as const;
