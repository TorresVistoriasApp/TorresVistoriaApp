/**
 * Slots futuros de consulta veicular no PDF.
 *
 * A Torres Consulta terá APIs externas (leilão, sinistro, gravame, etc.).
 * Este módulo define a forma dos dados e o builder visual — só renderiza
 * quando houver payload real. Nunca inventa dados nem mostra blocos vazios.
 */
import type { PdfIconName } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-icons";
import type { PdfNode } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-tokens";
import type { PremiumStatus } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-premium-section";
import {
  premiumKvGrid,
  premiumSection,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-premium-section";

/** Chaves reservadas para integração futura com Torres Consulta. */
export type ConsultaSlotKey =
  | "resumo"
  | "leilao"
  | "remarketing"
  | "sinistro"
  | "roubo_furto"
  | "restricoes"
  | "gravame"
  | "recall"
  | "proprietarios"
  | "debitos"
  | "renajud"
  | "score"
  | "mercado"
  | "fotos_historicas"
  | "historico_consultas";

export type ConsultaSlot = {
  key: ConsultaSlotKey;
  title: string;
  subtitle: string;
  barLabel?: string;
  icon: PdfIconName;
  accent?: string;
  status?: PremiumStatus;
  /** Pares rótulo/valor já resolvidos. */
  rows?: [string, string][];
  /** Texto livre (parecer / observação da base). */
  body?: string;
};

const SLOT_DEFAULTS: Record<
  ConsultaSlotKey,
  Pick<ConsultaSlot, "title" | "subtitle" | "barLabel" | "icon">
> = {
  resumo: {
    title: "Resumo de consulta veicular",
    subtitle: "Visão consolidada das bases consultadas.",
    barLabel: "Resumo",
    icon: "inspection",
  },
  leilao: {
    title: "Leilão",
    subtitle: "Registros públicos de leilão nas bases consultadas.",
    barLabel: "Leilão",
    icon: "market",
  },
  remarketing: {
    title: "Remarketing",
    subtitle: "Registros de remarketing nas bases consultadas.",
    barLabel: "Remarketing",
    icon: "market",
  },
  sinistro: {
    title: "Indício de sinistro",
    subtitle: "Consulta a registros de sinistro nas bases conveniadas.",
    barLabel: "Sinistro",
    icon: "damage",
  },
  roubo_furto: {
    title: "Roubo ou furto",
    subtitle: "Consulta a registros de roubo e furto.",
    barLabel: "Roubo / Furto",
    icon: "shield",
  },
  restricoes: {
    title: "Restrições",
    subtitle: "Restrições administrativas e judiciais encontradas.",
    barLabel: "Restrições",
    icon: "legal",
  },
  gravame: {
    title: "Gravame",
    subtitle: "Registro de gravame financeiro nas bases consultadas.",
    barLabel: "Gravame",
    icon: "document",
  },
  recall: {
    title: "Recall",
    subtitle: "Campanhas de recall aplicáveis ao veículo.",
    barLabel: "Recall",
    icon: "damage",
  },
  proprietarios: {
    title: "Histórico de proprietários",
    subtitle: "Informações de titularidade quando disponíveis.",
    barLabel: "Proprietários",
    icon: "identification",
  },
  debitos: {
    title: "Débitos estaduais",
    subtitle: "IPVA, licenciamento, multas e demais débitos.",
    barLabel: "Débitos",
    icon: "market",
  },
  renajud: {
    title: "Renajud",
    subtitle: "Restrições judiciais vinculadas ao veículo.",
    barLabel: "Renajud",
    icon: "legal",
  },
  score: {
    title: "Score veicular",
    subtitle: "Indicadores estatísticos de risco e aceitação.",
    barLabel: "Score",
    icon: "conclusion",
  },
  mercado: {
    title: "Dados de mercado",
    subtitle: "Referências de preço e aceitação securitária.",
    barLabel: "Mercado",
    icon: "market",
  },
  fotos_historicas: {
    title: "Fotos históricas",
    subtitle: "Registros fotográficos provenientes de bases externas.",
    barLabel: "Fotos",
    icon: "camera",
  },
  historico_consultas: {
    title: "Histórico de consulta",
    subtitle: "Consultas anteriores registradas para este veículo.",
    barLabel: "Histórico",
    icon: "checklist",
  },
};

function hasSlotContent(slot: ConsultaSlot): boolean {
  return Boolean(
    (slot.rows && slot.rows.length > 0) ||
      (slot.body && slot.body.trim().length > 0),
  );
}

/**
 * Constrói seções de consulta apenas quando há dados.
 * Passar `[]` ou slots vazios → nada é renderizado no PDF atual.
 */
export function buildConsultaSections(
  slots: ConsultaSlot[],
  options: { accent?: string } = {},
): PdfNode[] {
  const nodes: PdfNode[] = [];

  for (const slot of slots) {
    if (!hasSlotContent(slot)) continue;
    const defaults = SLOT_DEFAULTS[slot.key];
    const children: PdfNode[] = [];

    if (slot.rows?.length) {
      const grid = premiumKvGrid(slot.rows, { columns: 2 });
      if (grid) children.push(grid);
    }
    if (slot.body?.trim()) {
      children.push({
        text: slot.body.trim(),
        fontSize: 8.5,
        color: "#0f172a",
        margin: [0, slot.rows?.length ? 6 : 0, 0, 0],
      });
    }

    nodes.push(
      premiumSection({
        icon: slot.icon ?? defaults.icon,
        title: slot.title || defaults.title,
        subtitle: slot.subtitle || defaults.subtitle,
        barLabel: slot.barLabel || defaults.barLabel,
        barIcon: slot.icon ?? defaults.icon,
        accent: slot.accent ?? options.accent,
        status: slot.status,
        children,
      }),
    );
  }

  return nodes;
}

/** Catálogo de slots disponíveis — útil para a futura integração da API. */
export function listConsultaSlotDefaults(): typeof SLOT_DEFAULTS {
  return SLOT_DEFAULTS;
}
