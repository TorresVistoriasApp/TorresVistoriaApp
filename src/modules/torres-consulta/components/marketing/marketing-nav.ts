import { ROUTES } from "@/config/routes";

/** Páginas de conteúdo — usadas no menu mobile (sem duplicar ações). */
export const MARKETING_PAGE_NAV = [
  { label: "Como Funciona", to: ROUTES.comoFunciona },
  { label: "Planos", to: ROUTES.planos },
  { label: "Exemplo", to: ROUTES.relatorioExemplo },
] as const;

/** Navegação completa da barra desktop. */
export const MARKETING_HEADER_NAV = [
  ...MARKETING_PAGE_NAV,
  { label: "Para Vistoriadores", to: ROUTES.vistoriaLogin },
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
