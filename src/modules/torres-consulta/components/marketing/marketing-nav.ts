import { ROUTES } from "@/config/routes";

export const MARKETING_HEADER_NAV = [
  { label: "Como Funciona", to: ROUTES.comoFunciona },
  { label: "Planos", to: ROUTES.planos },
  { label: "Para Vistoriadores", to: ROUTES.vistoriaLogin },
  { label: "Exemplo", to: ROUTES.relatorioExemplo },
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
    { label: "Para Vistoriadores", to: ROUTES.vistoriaLogin },
    { label: "Relatório Exemplo", to: ROUTES.relatorioExemplo },
  ],
  legal: [
    { label: "LGPD", to: ROUTES.lgpd },
    { label: "Privacidade", to: ROUTES.privacy },
    { label: "Termos", to: ROUTES.termos },
    { label: "Cookies", to: ROUTES.cookies },
  ],
  suporte: [
    { label: "Área do Cliente", to: ROUTES.consultaLogin },
    { label: "Área do Vistoriador", to: ROUTES.vistoriaLogin },
  ],
} as const;
