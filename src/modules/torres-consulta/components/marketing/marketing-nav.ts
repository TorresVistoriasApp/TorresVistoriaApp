import { ROUTES } from "@/config/routes";

/** Páginas de conteúdo usadas no menu mobile (sem duplicar ações). */
export const MARKETING_PAGE_NAV = [
  { label: "Como funciona", to: ROUTES.comoFunciona },
  { label: "Planos", to: ROUTES.planos },
  { label: "Exemplo", to: ROUTES.relatorioExemplo },
] as const;

/** Navegação completa da barra desktop. */
export const MARKETING_HEADER_NAV = [
  ...MARKETING_PAGE_NAV,
  { label: "Para vistoriadores", to: ROUTES.vistoriaLogin },
] as const;

export const MARKETING_FOOTER = {
  empresa: [
    { label: "Sobre", to: ROUTES.sobre },
    { label: "Contato", to: ROUTES.contato },
    { label: "Ajuda", to: ROUTES.ajuda },
  ],
  produto: [
    { label: "Como funciona", to: ROUTES.comoFunciona },
    { label: "Planos", to: ROUTES.planos },
    { label: "Para vistoriadores", to: ROUTES.vistoriaLogin },
    { label: "Relatório de exemplo", to: ROUTES.relatorioExemplo },
  ],
  legal: [
    { label: "LGPD", to: ROUTES.lgpd },
    { label: "Privacidade", to: ROUTES.privacy },
    { label: "Termos", to: ROUTES.termos },
    { label: "Cookies", to: ROUTES.cookies },
  ],
  suporte: [
    { label: "Área do cliente", to: ROUTES.consultaLogin },
    { label: "Área do vistoriador", to: ROUTES.vistoriaLogin },
  ],
} as const;
