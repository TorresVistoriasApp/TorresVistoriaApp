/**
 * Preparação de dados do laudo PDF.
 *
 * Traduz o payload do laudo em indicadores, séries de gráfico, agrupamentos e
 * conclusões. Só deriva do que existe na vistoria: nenhum valor é estimado ou
 * preenchido por padrão quando o dado não foi coletado.
 */
import type { ChecklistItem } from "@/modules/torres-vistoria/services/checklist-service";
import { ChecklistStatus } from "@/modules/torres-vistoria/domain/enums";
import {
  CHECKLIST_CATEGORY_ORDER,
  getChecklistCategoryLabel,
} from "@/modules/torres-vistoria/domain/checklist/checklist-catalog";
import { getChecklistStatusPdfColor, getChecklistStatusPdfLabel } from "@/modules/torres-vistoria/domain/checklist/checklist-status";
import { formatChecklistObservationForPdf } from "@/modules/torres-vistoria/domain/checklist/checklist-issue-options";
import {
  getOpinionLabel,
  getPrimaryColor,
  summarizeLaudoChecklist,
  type ChecklistStats,
  type LaudoPayload,
  type LaudoPhoto,
} from "@/modules/torres-vistoria/domain/laudo/laudo-model";
import {
  isOpinionReproved,
  isOpinionWithObservations,
} from "@/modules/torres-vistoria/domain/inspection-opinion-labels";
import { normalizePhotoCategory } from "@/modules/torres-vistoria/domain/photos/photo-catalog";
import {
  PDF_COLOR,
  categoryPaletteColor,
  type PdfTone,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-tokens";

export type LaudoChartSlice = {
  label: string;
  value: number;
  color: string;
};

export type LaudoIndicator = {
  label: string;
  value: string;
  accent: string;
  hint?: string;
};

export type LaudoCategorySummary = {
  key: string;
  label: string;
  total: number;
  conforme: number;
  naoConforme: number;
  naoAplicavel: number;
  pendente: number;
  items: ChecklistItem[];
};

export type LaudoApontamento = {
  categoryLabel: string;
  itemName: string;
  note: string;
};

export type LaudoDamage = {
  location: string;
  category: string | null;
  severity: string | null;
  displayName: string | null;
};

export type LaudoZoneState = "AVARIA" | "REGISTRADA" | "SEM_REGISTRO";

export type LaudoPaintZone = {
  key: string;
  label: string;
  state: LaudoZoneState;
  /** Coordenadas normalizadas (0..1) na silhueta técnica do veículo. */
  x: number;
  y: number;
  detail?: string;
};

export type LaudoReportViewModel = {
  primaryColor: string;
  stats: ChecklistStats;
  opinionLabel: string;
  opinionTone: PdfTone;
  riskTone: PdfTone;
  photoCount: number;
  indicators: LaudoIndicator[];
  checklistDistribution: LaudoChartSlice[];
  categoryDistribution: LaudoChartSlice[];
  categoryDistributionTitle: string;
  categoryDistributionCaption: string;
  categories: LaudoCategorySummary[];
  apontamentos: LaudoApontamento[];
  damages: LaudoDamage[];
  paintZones: LaudoPaintZone[];
  paintChecklistItems: ChecklistItem[];
  hasPaintAnalysisData: boolean;
  conclusionHighlights: string[];
};

export function getOpinionTone(opinionLabel: string): PdfTone {
  if (isOpinionReproved(opinionLabel)) return "danger";
  if (isOpinionWithObservations(opinionLabel)) return "warning";
  if (opinionLabel.toUpperCase().includes("PENDENTE")) return "neutral";
  return "success";
}

export function getRiskTone(riskLevel: ChecklistStats["riskLevel"]): PdfTone {
  if (riskLevel === "ALTO") return "danger";
  if (riskLevel === "MEDIO") return "warning";
  return "success";
}

/** Série do gráfico principal: composição real do checklist por status. */
export function buildChecklistDistribution(stats: ChecklistStats): LaudoChartSlice[] {
  return [
    {
      label: getChecklistStatusPdfLabel(ChecklistStatus.CONFORME),
      value: stats.conforme,
      color: getChecklistStatusPdfColor(ChecklistStatus.CONFORME),
    },
    {
      label: getChecklistStatusPdfLabel(ChecklistStatus.NAO_CONFORME),
      value: stats.naoConforme,
      color: getChecklistStatusPdfColor(ChecklistStatus.NAO_CONFORME),
    },
    {
      label: getChecklistStatusPdfLabel(ChecklistStatus.NA),
      value: stats.naoAplicavel,
      color: getChecklistStatusPdfColor(ChecklistStatus.NA),
    },
    {
      label: getChecklistStatusPdfLabel(ChecklistStatus.PENDENTE),
      value: stats.pendente,
      color: getChecklistStatusPdfColor(ChecklistStatus.PENDENTE),
    },
  ];
}

function categoryOrderIndex(key: string): number {
  const index = CHECKLIST_CATEGORY_ORDER.indexOf(key);
  return index === -1 ? CHECKLIST_CATEGORY_ORDER.length : index;
}

export function buildCategorySummaries(checklist: ChecklistItem[]): LaudoCategorySummary[] {
  const grouped = new Map<string, ChecklistItem[]>();

  for (const item of checklist) {
    const bucket = grouped.get(item.category);
    if (bucket) bucket.push(item);
    else grouped.set(item.category, [item]);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => categoryOrderIndex(a) - categoryOrderIndex(b))
    .map(([key, items]) => ({
      key,
      label: getChecklistCategoryLabel(key),
      total: items.length,
      conforme: items.filter((item) => item.status === ChecklistStatus.CONFORME).length,
      naoConforme: items.filter((item) => item.status === ChecklistStatus.NAO_CONFORME).length,
      naoAplicavel: items.filter((item) => item.status === ChecklistStatus.NA).length,
      pendente: items.filter((item) => item.status === ChecklistStatus.PENDENTE).length,
      items,
    }));
}

/**
 * Segundo gráfico. Quando há apontamentos, mostra onde eles se concentram;
 * caso contrário, mostra o volume avaliado por categoria. Em ambos os casos os
 * valores vêm direto do checklist.
 */
export function buildCategoryDistribution(categories: LaudoCategorySummary[]): {
  slices: LaudoChartSlice[];
  title: string;
  caption: string;
} {
  const withApontamentos = categories.filter((category) => category.naoConforme > 0);

  if (withApontamentos.length > 0) {
    return {
      title: "Apontamentos por categoria",
      caption: "Concentração dos itens aprovados com apontamentos.",
      slices: withApontamentos.map((category, index) => ({
        label: category.label,
        value: category.naoConforme,
        color: categoryPaletteColor(index),
      })),
    };
  }

  return {
    title: "Itens por categoria",
    caption: "Distribuição dos itens avaliados no checklist técnico.",
    slices: categories.map((category, index) => ({
      label: category.label,
      value: category.total,
      color: categoryPaletteColor(index),
    })),
  };
}

export function buildIndicators(stats: ChecklistStats, photoCount: number): LaudoIndicator[] {
  return [
    {
      label: "Itens avaliados",
      value: `${stats.evaluated}`,
      accent: PDF_COLOR.navy,
      hint: `de ${stats.total} no checklist`,
    },
    {
      label: "Aprovados",
      value: `${stats.conforme}`,
      accent: getChecklistStatusPdfColor(ChecklistStatus.CONFORME),
    },
    {
      label: "Apontamentos",
      value: `${stats.naoConforme}`,
      accent: getChecklistStatusPdfColor(ChecklistStatus.NAO_CONFORME),
    },
    {
      label: "Não avaliados",
      value: `${stats.naoAplicavel}`,
      accent: getChecklistStatusPdfColor(ChecklistStatus.NA),
    },
    {
      label: "Pendências",
      value: `${stats.pendente}`,
      accent: getChecklistStatusPdfColor(ChecklistStatus.PENDENTE),
    },
    {
      label: "Fotografias",
      value: `${photoCount}`,
      accent: PDF_COLOR.info,
    },
  ];
}

export function buildApontamentos(categories: LaudoCategorySummary[]): LaudoApontamento[] {
  return categories.flatMap((category) =>
    category.items
      .filter((item) => item.status === ChecklistStatus.NAO_CONFORME)
      .map((item) => ({
        categoryLabel: category.label,
        itemName: item.item_name,
        note: formatChecklistObservationForPdf(item.status, item.notes),
      })),
  );
}

export function buildDamages(photos: LaudoPhoto[]): LaudoDamage[] {
  return photos
    .filter((photo) => Boolean(photo.damage_location?.trim()))
    .map((photo) => ({
      location: photo.damage_location!.trim(),
      category: photo.damage_category?.trim() || null,
      severity: photo.damage_severity?.trim() || null,
      displayName: photo.display_name?.trim() || null,
    }));
}

// ─── Análise de pintura / estrutura ──────────────────────────────────────────

/**
 * Tokens de localização usados tanto no texto livre de avaria quanto no nome
 * das categorias de foto. Normalizar reduz "Porta dianteira esquerda",
 * "porta diant. esq." e "PORTA_DIANT_ESQ" à mesma chave.
 */
function normalizeLocation(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/para\s*choque/g, "parachoque")
    .replace(/porta\s*malas/g, "portamalas")
    .replace(/\bdianteir[ao]s?\b/g, "diant")
    .replace(/\bdiant\w*/g, "diant")
    .replace(/\btraseir[ao]s?\b/g, "tras")
    .replace(/\btras\w*/g, "tras")
    .replace(/\besquerd[ao]s?\b/g, "esq")
    .replace(/\besq\w*/g, "esq")
    .replace(/\bdireit[ao]s?\b/g, "dir")
    .replace(/\bdir\w*/g, "dir")
    .replace(/\s+/g, " ")
    .trim();
}

type PaintZoneDefinition = {
  key: string;
  label: string;
  /** Todos os tokens precisam aparecer no texto normalizado da avaria. */
  tokens: string[];
  /** Categorias de foto que evidenciam a região. */
  photoCategories: string[];
  x: number;
  y: number;
};

const PAINT_ZONES: PaintZoneDefinition[] = [
  {
    key: "PARACHOQUE_DIANT",
    label: "Para-choque dianteiro",
    tokens: ["parachoque", "diant"],
    photoCategories: ["PINT_PARACHOQUE_DIANTEIRO", "EXT_PARACHOQUE_DIANTEIRO"],
    x: 0.5,
    y: 0.045,
  },
  {
    key: "CAPO",
    label: "Capô",
    tokens: ["capo"],
    photoCategories: ["PINT_CAPO", "EXT_CAPO"],
    x: 0.5,
    y: 0.15,
  },
  {
    key: "PARALAMA_DIANT_ESQ",
    label: "Paralama dianteiro esquerdo",
    tokens: ["paralama", "esq"],
    photoCategories: ["PINT_PARALAMA_DIANT_ESQ", "MOT_PARALAMA_TORRE_ESQ"],
    x: 0.235,
    y: 0.185,
  },
  {
    key: "PARALAMA_DIANT_DIR",
    label: "Paralama dianteiro direito",
    tokens: ["paralama", "dir"],
    photoCategories: ["PINT_PARALAMA_DIANT_DIR", "MOT_PARALAMA_TORRE_DIR"],
    x: 0.765,
    y: 0.185,
  },
  {
    key: "TETO",
    label: "Teto",
    tokens: ["teto"],
    photoCategories: ["PINT_TETO", "EXT_TETO"],
    x: 0.5,
    y: 0.5,
  },
  {
    key: "PORTA_DIANT_ESQ",
    label: "Porta dianteira esquerda",
    tokens: ["porta", "diant", "esq"],
    photoCategories: ["PINT_PORTA_DIANT_ESQ", "QDP_PORTA_DIANT_ESQ", "LAT_QUADRO_PORTA_DIANT_ESQ"],
    x: 0.2,
    y: 0.42,
  },
  {
    key: "PORTA_DIANT_DIR",
    label: "Porta dianteira direita",
    tokens: ["porta", "diant", "dir"],
    photoCategories: ["PINT_PORTA_DIANT_DIR", "QDP_PORTA_DIANT_DIR", "LAT_QUADRO_PORTA_DIANT_DIR"],
    x: 0.8,
    y: 0.42,
  },
  {
    key: "PORTA_TRAS_ESQ",
    label: "Porta traseira esquerda",
    tokens: ["porta", "tras", "esq"],
    photoCategories: [
      "PINT_PORTA_TRASEIRA_ESQ",
      "QDP_PORTA_TRASEIRA_ESQ",
      "LAT_QUADRO_PORTA_TRASEIRA_ESQ",
    ],
    x: 0.2,
    y: 0.6,
  },
  {
    key: "PORTA_TRAS_DIR",
    label: "Porta traseira direita",
    tokens: ["porta", "tras", "dir"],
    photoCategories: [
      "PINT_PORTA_TRASEIRA_DIR",
      "QDP_PORTA_TRASEIRA_DIR",
      "LAT_QUADRO_PORTA_TRASEIRA_DIR",
    ],
    x: 0.8,
    y: 0.6,
  },
  {
    key: "LATERAL_TRAS_ESQ",
    label: "Lateral traseira esquerda",
    tokens: ["lateral", "tras", "esq"],
    photoCategories: ["PINT_LATERAL_TRASEIRA_ESQ", "LAT_COLUNA_TRASEIRA_ESQ"],
    x: 0.225,
    y: 0.775,
  },
  {
    key: "LATERAL_TRAS_DIR",
    label: "Lateral traseira direita",
    tokens: ["lateral", "tras", "dir"],
    photoCategories: ["PINT_LATERAL_TRASEIRA_DIR", "LAT_COLUNA_TRASEIRA_DIR"],
    x: 0.775,
    y: 0.775,
  },
  {
    key: "TAMPA_PORTA_MALAS",
    label: "Tampa do porta-malas",
    tokens: ["portamalas"],
    photoCategories: ["PINT_TAMPA_PORTA_MALAS", "EXT_TAMPA_PORTA_MALAS"],
    x: 0.5,
    y: 0.855,
  },
  {
    key: "PARACHOQUE_TRAS",
    label: "Para-choque traseiro",
    tokens: ["parachoque", "tras"],
    photoCategories: ["PINT_PARACHOQUE_TRASEIRO", "EXT_PARACHOQUE_TRASEIRO"],
    x: 0.5,
    y: 0.955,
  },
];

function damageMatchesZone(damage: LaudoDamage, zone: PaintZoneDefinition): boolean {
  const haystack = normalizeLocation(
    [damage.location, damage.displayName, damage.category].filter(Boolean).join(" "),
  );
  return zone.tokens.every((token) => haystack.split(" ").includes(token));
}

/**
 * Estado de cada região da silhueta. `AVARIA` só aparece quando existe uma
 * avaria fotografada apontando para a região; `REGISTRADA` quando há foto da
 * região; caso contrário `SEM_REGISTRO`. Nada é inferido além disso.
 */
export function buildPaintZones(photos: LaudoPhoto[], damages: LaudoDamage[]): LaudoPaintZone[] {
  const capturedCategories = new Set(
    photos.map((photo) => normalizePhotoCategory(photo.category)),
  );

  return PAINT_ZONES.map((zone) => {
    const matchedDamages = damages.filter((damage) => damageMatchesZone(damage, zone));

    if (matchedDamages.length > 0) {
      const severities = [...new Set(matchedDamages.map((damage) => damage.severity).filter(Boolean))];
      return {
        key: zone.key,
        label: zone.label,
        state: "AVARIA" as const,
        x: zone.x,
        y: zone.y,
        detail:
          severities.length > 0
            ? `${matchedDamages.length} avaria(s) · ${severities.join(", ")}`
            : `${matchedDamages.length} avaria(s) registrada(s)`,
      };
    }

    const hasPhoto = zone.photoCategories.some((category) => capturedCategories.has(category));
    return {
      key: zone.key,
      label: zone.label,
      state: hasPhoto ? ("REGISTRADA" as const) : ("SEM_REGISTRO" as const),
      x: zone.x,
      y: zone.y,
    };
  });
}

export const ZONE_STATE_LABEL: Record<LaudoZoneState, string> = {
  AVARIA: "Avaria registrada",
  REGISTRADA: "Registro fotográfico",
  SEM_REGISTRO: "Sem registro específico",
};

export const ZONE_STATE_COLOR: Record<LaudoZoneState, string> = {
  AVARIA: PDF_COLOR.danger,
  REGISTRADA: PDF_COLOR.success,
  SEM_REGISTRO: PDF_COLOR.subtle,
};

const PAINT_CHECKLIST_CATEGORY = "PINTURA";

function buildConclusionHighlights(
  stats: ChecklistStats,
  apontamentos: LaudoApontamento[],
  damages: LaudoDamage[],
  photoCount: number,
): string[] {
  const highlights: string[] = [
    `${stats.evaluated} de ${stats.total} itens do checklist técnico foram avaliados nesta vistoria.`,
  ];

  if (apontamentos.length === 0) {
    highlights.push("Nenhum item do checklist foi registrado com apontamento técnico.");
  } else {
    highlights.push(
      `${apontamentos.length} ${apontamentos.length === 1 ? "item foi registrado" : "itens foram registrados"} com apontamento técnico.`,
    );
    for (const apontamento of apontamentos) {
      highlights.push(
        [`${apontamento.categoryLabel} · ${apontamento.itemName}`, apontamento.note]
          .filter(Boolean)
          .join(": "),
      );
    }
  }

  if (damages.length > 0) {
    const locations = [...new Set(damages.map((damage) => damage.location))];
    highlights.push(
      `${damages.length} avaria(s) fotografada(s) em: ${locations.join(", ")}.`,
    );
  }

  if (stats.pendente > 0) {
    highlights.push(
      `${stats.pendente} item(ns) permanecem pendentes de avaliação e não compõem o resultado técnico.`,
    );
  }

  highlights.push(
    photoCount > 0
      ? `${photoCount} fotografia(s) compõem o registro probatório deste laudo.`
      : "Nenhuma fotografia foi anexada ao registro desta vistoria.",
  );

  return highlights;
}

export function buildLaudoReportViewModel(payload: LaudoPayload): LaudoReportViewModel {
  const stats = summarizeLaudoChecklist(payload.checklist);
  const opinionLabel = getOpinionLabel(payload.inspection.opinion);
  const categories = buildCategorySummaries(payload.checklist);
  const categoryDistribution = buildCategoryDistribution(categories);
  const apontamentos = buildApontamentos(categories);
  const damages = buildDamages(payload.photos);
  const paintZones = buildPaintZones(payload.photos, damages);
  const paintChecklistItems = payload.checklist.filter(
    (item) => item.category === PAINT_CHECKLIST_CATEGORY,
  );

  return {
    primaryColor: getPrimaryColor(payload.company),
    stats,
    opinionLabel,
    opinionTone: getOpinionTone(opinionLabel),
    riskTone: getRiskTone(stats.riskLevel),
    photoCount: payload.photos.length,
    indicators: buildIndicators(stats, payload.photos.length),
    checklistDistribution: buildChecklistDistribution(stats),
    categoryDistribution: categoryDistribution.slices,
    categoryDistributionTitle: categoryDistribution.title,
    categoryDistributionCaption: categoryDistribution.caption,
    categories,
    apontamentos,
    damages,
    paintZones,
    paintChecklistItems,
    hasPaintAnalysisData:
      paintChecklistItems.length > 0 ||
      damages.length > 0 ||
      paintZones.some((zone) => zone.state !== "SEM_REGISTRO"),
    conclusionHighlights: buildConclusionHighlights(
      stats,
      apontamentos,
      damages,
      payload.photos.length,
    ),
  };
}
