import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BookOpen,
  Camera,
  Car,
  FileText,
  Gauge,
  Key,
  Layers,
  LayoutDashboard,
  Paintbrush,
  Plus,
  Scan,
  Shield,
  Tag,
  Wrench,
} from "lucide-react";
import { resolveTechnicalGuide } from "@/lib/photos/visual-guides";
import type {
  PhotoCategoryDefinition,
  PhotoCategoryType,
  PhotoSectionDefinition,
  PhotoSubsectionDefinition,
  PhotoVisibilityCondition,
} from "@/lib/photos/types";
import {
  LEGACY_TO_NEW_CATEGORY,
  normalizePhotoCategory,
  photoMatchesCategory,
} from "@/lib/photos/legacy-category-map";

type CategoryInput = {
  key: string;
  name: string;
  description: string;
  icon?: LucideIcon;
  required?: boolean;
  minCount?: number;
  maxCount?: number;
  type?: PhotoCategoryType;
  subsectionKey?: string;
  visibleWhen?: PhotoVisibilityCondition;
};

function category(
  sectionKey: string,
  sortOrder: number,
  input: CategoryInput,
): PhotoCategoryDefinition {
  const type = input.type ?? "SINGLE";
  return {
    key: input.key,
    sectionKey,
    subsectionKey: input.subsectionKey,
    name: input.name,
    description: input.description,
    icon: input.icon ?? Camera,
    sortOrder,
    required: input.required ?? true,
    minCount: input.minCount ?? (type === "SINGLE" ? 1 : 0),
    maxCount:
      input.maxCount ??
      (type === "SINGLE" ? 1 : type === "DAMAGE" ? 50 : type === "COMPLEMENTARY" ? 999 : 10),
    type,
    technicalGuide: resolveTechnicalGuide(input.key, input.name),
    visualGuide: resolveTechnicalGuide(input.key, input.name),
    estimatedCaptureSeconds: 25,
    visibleWhen: input.visibleWhen,
  };
}

function subsection(
  key: string,
  sortOrder: number,
  name: string,
  categories: PhotoCategoryDefinition[],
  options?: {
    description?: string;
    guidance?: string;
    visibleWhen?: PhotoVisibilityCondition;
  },
): PhotoSubsectionDefinition {
  return {
    key,
    name,
    sortOrder,
    description: options?.description,
    guidance: options?.guidance,
    visibleWhen: options?.visibleWhen,
    categories,
  };
}

type SectionOptions = {
  collapsible?: boolean;
  defaultOpen?: boolean;
  guidance?: string;
  subsections?: PhotoSubsectionDefinition[];
  visibleWhen?: PhotoVisibilityCondition;
};

function section(
  key: string,
  sortOrder: number,
  name: string,
  description: string,
  icon: LucideIcon,
  categories: PhotoCategoryDefinition[],
  options?: SectionOptions,
): PhotoSectionDefinition {
  const subsections = options?.subsections;
  const resolvedCategories = subsections
    ? subsections.flatMap((group) => group.categories)
    : categories;

  const requiredCategories = resolvedCategories.filter((c) => c.required && c.type === "SINGLE");
  return {
    key,
    name,
    description,
    guidance: options?.guidance,
    icon,
    sortOrder,
    minRequiredCount: requiredCategories.length,
    maxAllowedCount: resolvedCategories.reduce((sum, c) => sum + c.maxCount, 0),
    categories: resolvedCategories,
    subsections,
    collapsible: options?.collapsible,
    defaultOpen: options?.defaultOpen ?? true,
    visibleWhen: options?.visibleWhen,
  };
}

// ─── Etapa 1 — Documentação ───────────────────────────────────────────────────

const DOCUMENTACAO_CATEGORIES = [
  category("DOCUMENTACAO", 1, {
    key: "DOC_VEICULO",
    name: "Documento do veículo",
    description: "Documento principal do veículo legível.",
    icon: FileText,
  }),
];

// ─── Etapa 2 — Parte frontal ──────────────────────────────────────────────────

const PARTE_FRONTAL_CATEGORIES = [
  category("PARTE_FRONTAL", 1, {
    key: "EXT_FRENTE_45_DIR",
    name: "Frente 45° direita",
    description: "Ângulo frontal direito do veículo.",
    icon: Car,
  }),
  category("PARTE_FRONTAL", 2, {
    key: "EXT_FRENTE_COMPLETA",
    name: "Frente inteira",
    description: "Vista frontal completa.",
    icon: Car,
  }),
  category("PARTE_FRONTAL", 3, {
    key: "EXT_FRENTE_45_ESQ",
    name: "Frente 45° esquerda",
    description: "Ângulo frontal esquerdo do veículo.",
    icon: Car,
  }),
];

// ─── Etapa 3 — Lado esquerdo ──────────────────────────────────────────────────

const LADO_ESQUERDO_CATEGORIES = [
  category("LADO_ESQUERDO", 1, {
    key: "EXT_LATERAL_ESQ",
    name: "Lateral esquerda",
    description: "Lateral completa do lado motorista.",
    icon: Car,
  }),
  category("LADO_ESQUERDO", 2, {
    key: "LAT_CAIXA_AR_ESQ",
    name: "Caixa de ar esquerda",
    description: "Caixa de ar/soleira esquerda.",
    icon: Layers,
  }),
  category("LADO_ESQUERDO", 3, {
    key: "LAT_QUADRO_PORTA_DIANT_ESQ",
    name: "Quadro da porta dianteira esquerda",
    description: "Quadro da porta dianteira esquerda.",
    icon: Layers,
  }),
  category("LADO_ESQUERDO", 4, {
    key: "LAT_COLUNA_DIANT_ESQ",
    name: "Coluna dianteira esquerda",
    description: "Coluna A esquerda.",
    icon: Layers,
  }),
  category("LADO_ESQUERDO", 5, {
    key: "LAT_COLUNA_CENTRAL_ESQ",
    name: "Coluna central esquerda",
    description: "Coluna B esquerda.",
    icon: Layers,
  }),
  category("LADO_ESQUERDO", 6, {
    key: "LAT_QUADRO_PORTA_TRASEIRA_ESQ",
    name: "Quadro da porta traseira esquerda",
    description: "Quadro da porta traseira esquerda.",
    icon: Layers,
  }),
  category("LADO_ESQUERDO", 7, {
    key: "LAT_COLUNA_TRASEIRA_ESQ",
    name: "Coluna traseira esquerda",
    description: "Coluna C esquerda.",
    icon: Layers,
  }),
];

// ─── Etapa 4 — Parte traseira ─────────────────────────────────────────────────

const PARTE_TRASEIRA_CATEGORIES = [
  category("PARTE_TRASEIRA", 1, {
    key: "EXT_TRASEIRA_45_ESQ",
    name: "Traseira 45° esquerda",
    description: "Ângulo traseiro esquerdo.",
    icon: Car,
  }),
  category("PARTE_TRASEIRA", 2, {
    key: "EXT_TRASEIRA_COMPLETA",
    name: "Traseira inteira",
    description: "Vista traseira completa.",
    icon: Car,
  }),
  category("PARTE_TRASEIRA", 3, {
    key: "EXT_TRASEIRA_45_DIR",
    name: "Traseira 45° direita",
    description: "Ângulo traseiro direito.",
    icon: Car,
  }),
  category("PARTE_TRASEIRA", 4, {
    key: "EXT_PLACA_TRASEIRA",
    name: "Placa traseira",
    description: "Placa traseira legível.",
    icon: Tag,
  }),
  category("PARTE_TRASEIRA", 5, {
    key: "EXT_LACRE_PLACA",
    name: "Lacre da placa",
    description: "Lacre da placa traseira.",
    icon: Tag,
  }),
];

// ─── Etapa 5 — Porta-malas ────────────────────────────────────────────────────

const PORTA_MALAS_CATEGORIES = [
  category("PORTA_MALAS", 1, {
    key: "TRS_PORTA_MALAS_ABERTO",
    name: "Porta-malas aberto",
    description: "Porta-malas aberto, visão geral.",
    icon: Layers,
  }),
  category("PORTA_MALAS", 2, {
    key: "TRS_PAINEL_SUPERIOR",
    name: "Painel traseiro",
    description: "Painel traseiro superior.",
    icon: Layers,
  }),
  category("PORTA_MALAS", 3, {
    key: "TRS_CAIXA_ESTEPE",
    name: "Caixa de estepe",
    description: "Compartimento do estepe.",
    icon: Layers,
  }),
  category("PORTA_MALAS", 4, {
    key: "TRS_PAINEL_ASSOALHO",
    name: "Painel traseiro com assoalho",
    description: "Painel traseiro e assoalho.",
    icon: Layers,
  }),
  category("PORTA_MALAS", 5, {
    key: "TRS_LONGARINA_TRASEIRA_ESQ",
    name: "Longarina traseira esquerda",
    description: "Longarina traseira esquerda.",
    icon: Layers,
  }),
  category("PORTA_MALAS", 6, {
    key: "TRS_LONGARINA_TRASEIRA_DIR",
    name: "Longarina traseira direita",
    description: "Longarina traseira direita.",
    icon: Layers,
  }),
  category("PORTA_MALAS", 7, {
    key: "TRS_ASSOALHO_PORTA_MALAS",
    name: "Assoalho traseiro inferior",
    description: "Assoalho traseiro inferior do porta-malas.",
    icon: Layers,
  }),
];

// ─── Etapa 6 — Lado direito ───────────────────────────────────────────────────

const LADO_DIREITO_CATEGORIES = [
  category("LADO_DIREITO", 1, {
    key: "LAT_CAIXA_AR_DIR",
    name: "Caixa de ar direita",
    description: "Caixa de ar/soleira direita.",
    icon: Layers,
  }),
  category("LADO_DIREITO", 2, {
    key: "LAT_QUADRO_PORTA_DIANT_DIR",
    name: "Quadro da porta dianteira direita",
    description: "Quadro da porta dianteira direita.",
    icon: Layers,
  }),
  category("LADO_DIREITO", 3, {
    key: "LAT_COLUNA_DIANT_DIR",
    name: "Coluna dianteira direita",
    description: "Coluna A direita.",
    icon: Layers,
  }),
  category("LADO_DIREITO", 4, {
    key: "LAT_COLUNA_CENTRAL_DIR",
    name: "Coluna central direita",
    description: "Coluna B direita.",
    icon: Layers,
  }),
  category("LADO_DIREITO", 5, {
    key: "LAT_QUADRO_PORTA_TRASEIRA_DIR",
    name: "Quadro da porta traseira direita",
    description: "Quadro da porta traseira direita.",
    icon: Layers,
  }),
  category("LADO_DIREITO", 6, {
    key: "LAT_COLUNA_TRASEIRA_DIR",
    name: "Coluna traseira direita",
    description: "Coluna C direita.",
    icon: Layers,
  }),
  category("LADO_DIREITO", 7, {
    key: "IDV_ETIQUETA_ETA_PASSAGEIRO",
    name: "Etiqueta ETA da porta do passageiro",
    description: "Etiqueta ETA visível na porta do passageiro.",
    icon: Tag,
  }),
];

// ─── Etapa 7 — Compartimento do motor ─────────────────────────────────────────

const COMPARTIMENTO_MOTOR_CATEGORIES = [
  category("COMPARTIMENTO_MOTOR", 1, {
    key: "MOT_COMPARTIMENTO",
    name: "Compartimento do motor",
    description: "Visão geral do compartimento.",
    icon: Wrench,
  }),
  category("COMPARTIMENTO_MOTOR", 2, {
    key: "MOT_ETIQUETA",
    name: "Etiqueta do compartimento do motor",
    description: "Etiqueta de identificação do motor.",
    icon: Tag,
  }),
  category("COMPARTIMENTO_MOTOR", 3, {
    key: "MOT_NUMERO_MOTOR",
    name: "Número do motor",
    description: "Gravação do número do motor.",
    icon: Wrench,
  }),
  category("COMPARTIMENTO_MOTOR", 4, {
    key: "MOT_PARALAMA_TORRE_ESQ",
    name: "Paralama dianteiro esquerdo com torre do amortecedor",
    description: "Paralama dianteiro esquerdo e torre do amortecedor.",
    icon: Wrench,
  }),
  category("COMPARTIMENTO_MOTOR", 5, {
    key: "MOT_PARALAMA_TORRE_DIR",
    name: "Paralama dianteiro direito com torre do amortecedor",
    description: "Paralama dianteiro direito e torre do amortecedor.",
    icon: Wrench,
  }),
  category("COMPARTIMENTO_MOTOR", 6, {
    key: "MOT_PAINEL_FRONTAL_SUPERIOR",
    name: "Painel frontal superior",
    description: "Painel frontal superior e travessas.",
    icon: Layers,
  }),
  category("COMPARTIMENTO_MOTOR", 7, {
    key: "MOT_PAINEL_FRONTAL_INFERIOR",
    name: "Painel frontal inferior",
    description: "Painel frontal inferior.",
    icon: Layers,
  }),
  category("COMPARTIMENTO_MOTOR", 8, {
    key: "MOT_LONGARINA_DIANT_ESQ",
    name: "Longarina dianteira esquerda",
    description: "Longarina dianteira esquerda.",
    icon: Layers,
  }),
  category("COMPARTIMENTO_MOTOR", 9, {
    key: "MOT_LONGARINA_DIANT_DIR",
    name: "Longarina dianteira direita",
    description: "Longarina dianteira direita.",
    icon: Layers,
  }),
];

// ─── Etapa 8 — Identificação ──────────────────────────────────────────────────

const IDENTIFICACAO_CATEGORIES = [
  category("IDENTIFICACAO", 1, {
    key: "IDV_GRAVACAO_VIDRO_DIANT",
    name: "Gravação do para-brisa",
    description: "Gravação no para-brisa.",
    icon: Scan,
  }),
  category("IDENTIFICACAO", 2, {
    key: "IDV_GRAVACAO_VIDRO_LATERAL",
    name: "Gravação do vidro lateral",
    description: "Gravação em vidro lateral.",
    icon: Scan,
  }),
  category("IDENTIFICACAO", 3, {
    key: "IDV_GRAVACAO_VIDRO_TRASE",
    name: "Gravação do vidro traseiro",
    description: "Gravação no vidro traseiro.",
    icon: Scan,
  }),
  category("IDENTIFICACAO", 4, {
    key: "IDV_NUMERO_CHASSI",
    name: "Número do chassi",
    description: "Gravação do chassi legível.",
    icon: Scan,
  }),
];

// ─── Etapa 9 — Interior ───────────────────────────────────────────────────────

const INTERIOR_CATEGORIES = [
  category("INTERIOR", 1, {
    key: "INT_HODOMETRO",
    name: "Hodômetro",
    description: "Quilometragem visível no hodômetro.",
    icon: Gauge,
  }),
  category("INTERIOR", 2, {
    key: "INT_QUILOMETRAGEM_REGISTRADA",
    name: "Quilometragem registrada",
    description: "Registro da quilometragem conforme documentação.",
    icon: Gauge,
  }),
  category("INTERIOR", 3, {
    key: "INT_PAINEL_BANCO_TRASEIRO",
    name: "Painel de instrumentos (foto do banco traseiro)",
    description: "Painel fotografado a partir do banco traseiro.",
    icon: LayoutDashboard,
  }),
];

// ─── Etapa 10 — Teto e pintura ────────────────────────────────────────────────

const TETO_PINTURA_CATEGORIES = [
  category("TETO_PINTURA", 1, {
    key: "PINT_TETO",
    name: "Pintura do teto",
    description: "Evidência de pintura do teto.",
    icon: Paintbrush,
  }),
];

// ─── Etapa 11 — Quadros das portas ────────────────────────────────────────────

const QDP_PORTAS_CATEGORIES = [
  category("QUADROS_PORTAS", 1, {
    key: "QDP_PORTA_DIANT_ESQ",
    subsectionKey: "QDP_PORTAS",
    name: "Porta dianteira esquerda",
    description: "Quadro da porta dianteira esquerda sem borracha de vedação.",
    icon: Layers,
  }),
  category("QUADROS_PORTAS", 2, {
    key: "QDP_PORTA_TRASEIRA_ESQ",
    subsectionKey: "QDP_PORTAS",
    name: "Porta traseira esquerda",
    description: "Quadro da porta traseira esquerda sem borracha de vedação.",
    icon: Layers,
  }),
  category("QUADROS_PORTAS", 3, {
    key: "QDP_PORTA_DIANT_DIR",
    subsectionKey: "QDP_PORTAS",
    name: "Porta dianteira direita",
    description: "Quadro da porta dianteira direita sem borracha de vedação.",
    icon: Layers,
  }),
  category("QUADROS_PORTAS", 4, {
    key: "QDP_PORTA_TRASEIRA_DIR",
    subsectionKey: "QDP_PORTAS",
    name: "Porta traseira direita",
    description: "Quadro da porta traseira direita sem borracha de vedação.",
    icon: Layers,
  }),
];

const QDP_TESTE_PINTURA_CATEGORIES = [
  category("QUADROS_PORTAS", 5, {
    key: "QDP_TESTE_PINTURA_1",
    subsectionKey: "QDP_TESTE_PINTURA",
    name: "Teste de pintura 1",
    description: "Foto com caneta teste ou medidor de espessura.",
    icon: Paintbrush,
  }),
  category("QUADROS_PORTAS", 6, {
    key: "QDP_TESTE_PINTURA_2",
    subsectionKey: "QDP_TESTE_PINTURA",
    name: "Teste de pintura 2",
    description: "Foto com caneta teste ou medidor de espessura.",
    icon: Paintbrush,
  }),
  category("QUADROS_PORTAS", 7, {
    key: "QDP_TESTE_PINTURA_3",
    subsectionKey: "QDP_TESTE_PINTURA",
    name: "Teste de pintura 3",
    description: "Foto com caneta teste ou medidor de espessura.",
    icon: Paintbrush,
  }),
  category("QUADROS_PORTAS", 8, {
    key: "QDP_TESTE_PINTURA_4",
    subsectionKey: "QDP_TESTE_PINTURA",
    name: "Teste de pintura 4",
    description: "Foto com caneta teste ou medidor de espessura.",
    icon: Paintbrush,
  }),
];

const QUADROS_PORTAS_SUBSECTIONS = [
  subsection("QDP_PORTAS", 1, "Quadros das portas", QDP_PORTAS_CATEGORIES, {
    guidance: "Fotografar os quadros das portas sem a borracha de vedação.",
  }),
  subsection("QDP_TESTE_PINTURA", 2, "Teste de pintura", QDP_TESTE_PINTURA_CATEGORIES, {
    guidance: "Utilize caneta teste ou medidor de espessura. São 4 fotografias obrigatórias.",
  }),
];

// ─── Etapa 12 — Fotos extras ──────────────────────────────────────────────────

const EXTRAS_ITENS_CATEGORIES = [
  category("FOTOS_EXTRAS", 1, {
    key: "EXTRA_CHAVE_PRINCIPAL",
    subsectionKey: "EXTRAS_ITENS",
    name: "Chave principal",
    description: "Chave principal do veículo.",
    icon: Key,
    required: false,
  }),
  category("FOTOS_EXTRAS", 2, {
    key: "EXTRA_CHAVE_RESERVA",
    subsectionKey: "EXTRAS_ITENS",
    name: "Chave reserva",
    description: "Chave reserva do veículo.",
    icon: Key,
    required: false,
  }),
  category("FOTOS_EXTRAS", 3, {
    key: "EXTRA_MANUAL_PROPRIETARIO",
    subsectionKey: "EXTRAS_ITENS",
    name: "Manual do proprietário",
    description: "Manual do proprietário.",
    icon: BookOpen,
    required: false,
  }),
  category("FOTOS_EXTRAS", 4, {
    key: "EXTRA_ESTEPE",
    subsectionKey: "EXTRAS_ITENS",
    name: "Estepe",
    description: "Estepe e estado de conservação.",
    icon: Car,
    required: false,
  }),
  category("FOTOS_EXTRAS", 5, {
    key: "EXTRA_RODAS",
    subsectionKey: "EXTRAS_ITENS",
    name: "Rodas",
    description: "Rodas do veículo.",
    icon: Car,
    required: false,
  }),
  category("FOTOS_EXTRAS", 6, {
    key: "EXTRA_PNEUS_ESTADO",
    subsectionKey: "EXTRAS_ITENS",
    name: "Pneus (estado de conservação)",
    description: "Estado geral de conservação dos pneus.",
    icon: Car,
    required: false,
  }),
  category("FOTOS_EXTRAS", 7, {
    key: "EXTRA_CHAVE_RODA",
    subsectionKey: "EXTRAS_ITENS",
    name: "Chave de roda",
    description: "Chave de roda.",
    icon: Wrench,
    required: false,
  }),
  category("FOTOS_EXTRAS", 8, {
    key: "EXTRA_MACACO",
    subsectionKey: "EXTRAS_ITENS",
    name: "Macaco",
    description: "Macaco hidráulico ou manual.",
    icon: Wrench,
    required: false,
  }),
  category("FOTOS_EXTRAS", 9, {
    key: "EXTRA_TRIANGULO",
    subsectionKey: "EXTRAS_ITENS",
    name: "Triângulo",
    description: "Triângulo de sinalização.",
    icon: AlertTriangle,
    required: false,
  }),
  category("FOTOS_EXTRAS", 10, {
    key: "COMPLEMENTAR",
    subsectionKey: "EXTRAS_ITENS",
    name: "Foto complementar",
    description: "Fotos adicionais não listadas acima.",
    icon: Plus,
    type: "COMPLEMENTARY",
    required: false,
    minCount: 0,
    maxCount: 999,
  }),
];

const EXTRAS_BLINDAGEM_CATEGORIES = [
  category("FOTOS_EXTRAS", 11, {
    key: "BLIND_VIDRO_DIANT_ESQ",
    subsectionKey: "EXTRAS_BLINDAGEM",
    name: "Vidro dianteiro esquerdo",
    description: "Vidro dianteiro esquerdo (blindagem).",
    icon: Shield,
    required: false,
  }),
  category("FOTOS_EXTRAS", 12, {
    key: "BLIND_VIDRO_DIANT_DIR",
    subsectionKey: "EXTRAS_BLINDAGEM",
    name: "Vidro dianteiro direito",
    description: "Vidro dianteiro direito (blindagem).",
    icon: Shield,
    required: false,
  }),
  category("FOTOS_EXTRAS", 13, {
    key: "BLIND_ESPESSURA_VIDRO",
    subsectionKey: "EXTRAS_BLINDAGEM",
    name: "Espessura do vidro",
    description: "Medição ou evidência da espessura do vidro blindado.",
    icon: Shield,
    required: false,
  }),
  category("FOTOS_EXTRAS", 14, {
    key: "BLIND_MARCA_VIDRO",
    subsectionKey: "EXTRAS_BLINDAGEM",
    name: "Marca gravada no vidro",
    description: "Marca gravada no vidro blindado.",
    icon: Shield,
    required: false,
  }),
  category("FOTOS_EXTRAS", 15, {
    key: "BLIND_DOC_AUTORIZACAO",
    subsectionKey: "EXTRAS_BLINDAGEM",
    name: "Documento de autorização da blindagem",
    description: "Documento de autorização da blindagem.",
    icon: FileText,
    required: false,
  }),
];

const FOTOS_EXTRAS_SUBSECTIONS = [
  subsection("EXTRAS_ITENS", 1, "Itens opcionais", EXTRAS_ITENS_CATEGORIES, {
    description: "Fotografias opcionais de acessórios e itens do veículo.",
  }),
  subsection("EXTRAS_BLINDAGEM", 2, "Blindagem", EXTRAS_BLINDAGEM_CATEGORIES, {
    description: "Evidências de blindagem — exibida apenas para veículos blindados.",
    visibleWhen: "armored",
  }),
];

// ─── Etapa 13 — Avarias ───────────────────────────────────────────────────────

const AVARIAS_CATEGORIES = [
  category("AVARIAS", 1, {
    key: "AVARIA",
    name: "Registro de avaria",
    description: "Fotografe cada avaria com localização, categoria e grau.",
    icon: AlertTriangle,
    type: "DAMAGE",
    required: false,
    minCount: 0,
    maxCount: 50,
  }),
];

// ─── Categorias legadas (retrocompatibilidade PDF / vistorias anteriores) ─────

const LEGACY_PINTURA_CATEGORIES = [
  category("LEGADO", 1, { key: "PINT_CAPO", name: "Capô (pintura)", description: "Evidência de pintura do capô.", icon: Paintbrush, required: false }),
  category("LEGADO", 2, { key: "PINT_TAMPA_PORTA_MALAS", name: "Tampa do porta-malas (pintura)", description: "Evidência da tampa do porta-malas.", icon: Paintbrush, required: false }),
  category("LEGADO", 3, { key: "PINT_PARALAMA_DIANT_ESQ", name: "Paralama dianteiro esquerdo (pintura)", description: "Paralama dianteiro esquerdo.", icon: Paintbrush, required: false }),
  category("LEGADO", 4, { key: "PINT_PORTA_DIANT_ESQ", name: "Porta dianteira esquerda (pintura)", description: "Porta dianteira esquerda.", icon: Paintbrush, required: false }),
  category("LEGADO", 5, { key: "PINT_PORTA_TRASEIRA_ESQ", name: "Porta traseira esquerda (pintura)", description: "Porta traseira esquerda.", icon: Paintbrush, required: false }),
  category("LEGADO", 6, { key: "PINT_LATERAL_TRASEIRA_ESQ", name: "Lateral traseira esquerda (pintura)", description: "Lateral traseira esquerda.", icon: Paintbrush, required: false }),
  category("LEGADO", 7, { key: "PINT_LATERAL_TRASEIRA_DIR", name: "Lateral traseira direita (pintura)", description: "Lateral traseira direita.", icon: Paintbrush, required: false }),
  category("LEGADO", 8, { key: "PINT_PORTA_TRASEIRA_DIR", name: "Porta traseira direita (pintura)", description: "Porta traseira direita.", icon: Paintbrush, required: false }),
  category("LEGADO", 9, { key: "PINT_PORTA_DIANT_DIR", name: "Porta dianteira direita (pintura)", description: "Porta dianteira direita.", icon: Paintbrush, required: false }),
  category("LEGADO", 10, { key: "PINT_PARALAMA_DIANT_DIR", name: "Paralama dianteiro direito (pintura)", description: "Paralama dianteiro direito.", icon: Paintbrush, required: false }),
  category("LEGADO", 11, { key: "PINT_PARACHOQUE_DIANTEIRO", name: "Para-choque dianteiro (pintura)", description: "Para-choque dianteiro.", icon: Paintbrush, required: false }),
  category("LEGADO", 12, { key: "PINT_PARACHOQUE_TRASEIRO", name: "Para-choque traseiro (pintura)", description: "Para-choque traseiro.", icon: Paintbrush, required: false }),
  category("LEGADO", 13, { key: "PINT_MEDIDOR_ESPESSURA", name: "Medidor de espessura", description: "Fotos com medidor de espessura.", icon: Paintbrush, type: "MULTI", required: false, minCount: 0, maxCount: 20 }),
  category("LEGADO", 14, { key: "PINT_CANETA_TESTE", name: "Caneta teste de pintura", description: "Fotos com caneta teste.", icon: Paintbrush, type: "MULTI", required: false, minCount: 0, maxCount: 20 }),
];

const LEGADO_CATEGORIES = [
  category("LEGADO", 101, { key: "DOC_CRLV", name: "CRLV", description: "Certificado de Registro e Licenciamento.", icon: FileText, type: "MULTI", required: false, minCount: 0, maxCount: 3 }),
  category("LEGADO", 102, { key: "DOC_CRV", name: "CRV", description: "Certificado de Registro de Veículo.", icon: FileText, type: "MULTI", required: false, minCount: 0, maxCount: 3 }),
  category("LEGADO", 103, { key: "DOC_ATPV_E", name: "ATPV-e", description: "Autorização para Transferência de Propriedade.", icon: FileText, type: "MULTI", required: false, minCount: 0, maxCount: 3 }),
  category("LEGADO", 104, { key: "DOC_OUTROS", name: "Outros documentos", description: "Documentos complementares.", icon: FileText, type: "MULTI", required: false, minCount: 0, maxCount: 10 }),
  category("LEGADO", 105, { key: "EXT_LATERAL_DIR", name: "Lateral direita", description: "Lateral completa do lado passageiro.", icon: Car, required: false }),
  category("LEGADO", 106, { key: "EXT_PLACA_DIANTEIRA", name: "Placa dianteira", description: "Placa dianteira legível.", icon: Tag, required: false }),
  category("LEGADO", 107, { key: "EXT_CAPO", name: "Capô", description: "Capô fechado, vista superior frontal.", icon: Car, required: false }),
  category("LEGADO", 108, { key: "EXT_TETO", name: "Teto externo", description: "Teto externo do veículo.", icon: Car, required: false }),
  category("LEGADO", 109, { key: "EXT_PARACHOQUE_DIANTEIRO", name: "Para-choque dianteiro", description: "Para-choque dianteiro completo.", icon: Car, required: false }),
  category("LEGADO", 110, { key: "EXT_PARACHOQUE_TRASEIRO", name: "Para-choque traseiro", description: "Para-choque traseiro completo.", icon: Car, required: false }),
  category("LEGADO", 111, { key: "EXT_TAMPA_PORTA_MALAS", name: "Tampa do porta-malas fechada", description: "Tampa do porta-malas fechada.", icon: Car, required: false }),
  category("LEGADO", 112, { key: "TRS_PAINEL_INFERIOR", name: "Painel traseiro inferior", description: "Painel traseiro inferior.", icon: Layers, required: false }),
  category("LEGADO", 113, { key: "MOT_TORRE_AMORT_ESQ", name: "Torre do amortecedor esquerda", description: "Torre/amortecedor dianteiro esquerdo.", icon: Wrench, required: false }),
  category("LEGADO", 114, { key: "MOT_TORRE_AMORT_DIR", name: "Torre do amortecedor direita", description: "Torre/amortecedor dianteiro direito.", icon: Wrench, required: false }),
  category("LEGADO", 115, { key: "MOT_PAINEL_FRONTAL", name: "Painel frontal", description: "Painel frontal e travessas.", icon: Layers, required: false }),
  category("LEGADO", 116, { key: "MOT_PAINEL_CORTA_FOGO", name: "Painel corta-fogo", description: "Painel corta-fogo e fixações.", icon: Layers, required: false }),
  category("LEGADO", 117, { key: "IDV_NUMERO_MOTOR", name: "Número do motor (identificação)", description: "Gravação do motor legível.", icon: Scan, required: false }),
  category("LEGADO", 118, { key: "IDV_ETIQUETA_MOTOR", name: "Etiqueta do compartimento (identificação)", description: "Etiqueta no compartimento do motor.", icon: Tag, required: false }),
  category("LEGADO", 119, { key: "IDV_ETIQUETA_COLUNA_DIR", name: "Etiqueta da coluna direita", description: "Etiqueta de identificação na coluna.", icon: Tag, required: false }),
  category("LEGADO", 120, { key: "INT_PAINEL_INSTRUMENTOS", name: "Painel de instrumentos", description: "Painel e instrumentos.", icon: LayoutDashboard, required: false }),
  category("LEGADO", 121, { key: "INT_VOLANTE", name: "Volante", description: "Volante e comandos.", icon: LayoutDashboard, required: false }),
  category("LEGADO", 122, { key: "INT_CONSOLE_CENTRAL", name: "Console central", description: "Console central e alavancas.", icon: LayoutDashboard, required: false }),
  category("LEGADO", 123, { key: "INT_BANCOS_DIANTEIROS", name: "Bancos dianteiros", description: "Bancos dianteiros.", icon: LayoutDashboard, required: false }),
  category("LEGADO", 124, { key: "INT_BANCOS_TRASEIROS", name: "Bancos traseiros", description: "Bancos traseiros.", icon: LayoutDashboard, required: false }),
  category("LEGADO", 125, { key: "INT_PORTAS_INTERNAS", name: "Portas internas", description: "Acabamento interno das portas.", icon: LayoutDashboard, required: false }),
  category("LEGADO", 126, { key: "INT_REVESTIMENTOS", name: "Revestimentos internos", description: "Revestimentos e carpetes.", icon: LayoutDashboard, required: false }),
  category("LEGADO", 127, { key: "SEG_CINTO_DATA", name: "Data do cinto de segurança", description: "Etiqueta de data do cinto.", icon: Shield, required: false }),
  category("LEGADO", 128, { key: "SEG_AIRBAGS", name: "Airbags", description: "Indicadores e etiquetas de airbag.", icon: Shield, required: false }),
  category("LEGADO", 129, { key: "SEG_EXTINTOR", name: "Extintor", description: "Extintor de incêndio.", icon: Shield, required: false }),
  category("LEGADO", 130, { key: "SEG_MACACO", name: "Macaco (segurança)", description: "Macaco hidráulico ou manual.", icon: Wrench, required: false }),
  category("LEGADO", 131, { key: "SEG_TRIANGULO", name: "Triângulo (segurança)", description: "Triângulo de sinalização.", icon: AlertTriangle, required: false }),
  category("LEGADO", 132, { key: "SEG_CHAVE_RODA", name: "Chave de roda (segurança)", description: "Chave de roda.", icon: Wrench, required: false }),
  category("LEGADO", 133, { key: "SEG_ESTEPE", name: "Estepe (segurança)", description: "Estepe e estado.", icon: Car, required: false }),
  category("LEGADO", 134, { key: "ROD_DIANT_ESQ", name: "Roda dianteira esquerda", description: "Roda e pneu dianteiro esquerdo.", icon: Car, required: false }),
  category("LEGADO", 135, { key: "ROD_DIANT_DIR", name: "Roda dianteira direita", description: "Roda e pneu dianteiro direito.", icon: Car, required: false }),
  category("LEGADO", 136, { key: "ROD_TRASEIRA_ESQ", name: "Roda traseira esquerda", description: "Roda e pneu traseiro esquerdo.", icon: Car, required: false }),
  category("LEGADO", 137, { key: "ROD_TRASEIRA_DIR", name: "Roda traseira direita", description: "Roda e pneu traseiro direito.", icon: Car, required: false }),
  category("LEGADO", 138, { key: "ROD_ESTADO_PNEUS", name: "Estado dos pneus", description: "Estado geral dos pneus.", icon: Car, required: false }),
  category("LEGADO", 139, { key: "ROD_SULCO_PNEUS", name: "Sulco dos pneus", description: "Profundidade do sulco.", icon: Car, required: false }),
  ...LEGACY_PINTURA_CATEGORIES,
];

/** Seções do fluxo de captura — ordem do percurso físico do vistoriador. */
export const PHOTO_CAPTURE_SECTIONS: PhotoSectionDefinition[] = [
  section(
    "DOCUMENTACAO",
    1,
    "Documentação",
    "Capture o documento principal do veículo.",
    FileText,
    DOCUMENTACAO_CATEGORIES,
    { collapsible: true, defaultOpen: true },
  ),
  section(
    "PARTE_FRONTAL",
    2,
    "Parte frontal",
    "Fotografe a frente do veículo em três ângulos.",
    Car,
    PARTE_FRONTAL_CATEGORIES,
    { collapsible: true, defaultOpen: false },
  ),
  section(
    "LADO_ESQUERDO",
    3,
    "Lado esquerdo",
    "Percorra o lado esquerdo do veículo de dianteira para traseira.",
    Layers,
    LADO_ESQUERDO_CATEGORIES,
    { collapsible: true, defaultOpen: false },
  ),
  section(
    "PARTE_TRASEIRA",
    4,
    "Parte traseira",
    "Fotografe a traseira, placa e lacre.",
    Car,
    PARTE_TRASEIRA_CATEGORIES,
    { collapsible: true, defaultOpen: false },
  ),
  section(
    "PORTA_MALAS",
    5,
    "Porta-malas",
    "Estrutura interna do porta-malas e assoalho.",
    Layers,
    PORTA_MALAS_CATEGORIES,
    { collapsible: true, defaultOpen: false },
  ),
  section(
    "LADO_DIREITO",
    6,
    "Lado direito",
    "Percorra o lado direito do veículo de traseira para dianteira.",
    Layers,
    LADO_DIREITO_CATEGORIES,
    { collapsible: true, defaultOpen: false },
  ),
  section(
    "COMPARTIMENTO_MOTOR",
    7,
    "Compartimento do motor",
    "Evidências do compartimento do motor e estrutura dianteira.",
    Wrench,
    COMPARTIMENTO_MOTOR_CATEGORIES,
    { collapsible: true, defaultOpen: false },
  ),
  section(
    "IDENTIFICACAO",
    8,
    "Identificação",
    "Gravações de vidros e número do chassi.",
    Scan,
    IDENTIFICACAO_CATEGORIES,
    { collapsible: true, defaultOpen: false },
  ),
  section(
    "INTERIOR",
    9,
    "Interior",
    "Hodômetro, quilometragem e painel de instrumentos.",
    LayoutDashboard,
    INTERIOR_CATEGORIES,
    { collapsible: true, defaultOpen: false },
  ),
  section(
    "TETO_PINTURA",
    10,
    "Teto e pintura",
    "Evidência de pintura do teto.",
    Paintbrush,
    TETO_PINTURA_CATEGORIES,
    { collapsible: true, defaultOpen: false },
  ),
  section(
    "QUADROS_PORTAS",
    11,
    "Quadros das portas",
    "Registre os quadros das portas e os testes de pintura obrigatórios.",
    Layers,
    [],
    {
      collapsible: true,
      defaultOpen: false,
      guidance: "Fotografar os quadros das portas sem a borracha de vedação.",
      subsections: QUADROS_PORTAS_SUBSECTIONS,
    },
  ),
  section(
    "FOTOS_EXTRAS",
    12,
    "Fotos extras",
    "Itens opcionais e complementares do veículo.",
    Plus,
    [],
    {
      collapsible: true,
      defaultOpen: false,
      subsections: FOTOS_EXTRAS_SUBSECTIONS,
    },
  ),
  section(
    "AVARIAS",
    13,
    "Avarias",
    "Registre cada avaria com localização, categoria e grau.",
    AlertTriangle,
    AVARIAS_CATEGORIES,
    { collapsible: true, defaultOpen: false },
  ),
];

const LEGADO_SECTION = section(
  "LEGADO",
  99,
  "Registros anteriores",
  "Fotos de categorias de versões anteriores do fluxo de captura.",
  Camera,
  LEGADO_CATEGORIES,
  { collapsible: true, defaultOpen: false },
);

/** Catálogo completo — fluxo de captura + categorias legadas (PDF e retrocompatibilidade). */
export const PHOTO_CATALOG: PhotoSectionDefinition[] = [...PHOTO_CAPTURE_SECTIONS, LEGADO_SECTION];

/** Todas as categorias achatadas, ordenadas por seção. */
export const ALL_PHOTO_CATEGORIES: PhotoCategoryDefinition[] = PHOTO_CATALOG.flatMap(
  (s) => s.categories,
);

/** Mapa rápido categoria → definição. */
export const PHOTO_CATEGORY_MAP: Record<string, PhotoCategoryDefinition> = Object.fromEntries(
  ALL_PHOTO_CATEGORIES.map((c) => [c.key, c]),
);

/** Mapa seção → definição. */
export const PHOTO_SECTION_MAP: Record<string, PhotoSectionDefinition> = Object.fromEntries(
  PHOTO_CATALOG.map((s) => [s.key, s]),
);

/** Chaves de todas as categorias (v2). */
export const PHOTO_CATEGORY_KEYS = ALL_PHOTO_CATEGORIES.map((c) => c.key);

/** Categorias obrigatórias (single-slot). */
export const MANDATORY_PHOTO_CATEGORY_KEYS = ALL_PHOTO_CATEGORIES.filter(
  (c) => c.required && c.type === "SINGLE",
).map((c) => c.key);

/** Categorias opcionais. */
export const OPTIONAL_PHOTO_CATEGORY_KEYS = ALL_PHOTO_CATEGORIES.filter((c) => !c.required).map(
  (c) => c.key,
);

/** Categorias de pintura por peça — usadas pelo módulo de laudo/pintura. */
export const PAINT_PHOTO_CATEGORY_KEYS = LEGACY_PINTURA_CATEGORIES.filter(
  (c) => c.type === "SINGLE",
).map((c) => c.key);

/** Labels para exibição — retrocompatível com PHOTO_CATEGORY_LABELS. */
export const PHOTO_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  ALL_PHOTO_CATEGORIES.map((c) => [c.key, c.name]),
);

/** Retrocompatibilidade: inclui labels legados. */
for (const [legacy, modern] of Object.entries(LEGACY_TO_NEW_CATEGORY)) {
  const label = PHOTO_CATEGORY_LABELS[modern];
  if (label) PHOTO_CATEGORY_LABELS[legacy] = label;
}

export function getPhotoCategory(key: string): PhotoCategoryDefinition | undefined {
  return PHOTO_CATEGORY_MAP[normalizePhotoCategory(key)];
}

export function getPhotoSection(key: string): PhotoSectionDefinition | undefined {
  return PHOTO_SECTION_MAP[key];
}

export function getPhotoCategoryLabel(key: string): string {
  const normalized = normalizePhotoCategory(key);
  return PHOTO_CATEGORY_LABELS[normalized] ?? PHOTO_CATEGORY_LABELS[key] ?? key.replace(/_/g, " ");
}

/** Retrocompatibilidade: exporta PHOTO_CATEGORIES como array de strings (v2 + legado). */
export const PHOTO_CATEGORIES = [
  ...PHOTO_CATEGORY_KEYS,
  ...Object.keys(LEGACY_TO_NEW_CATEGORY),
] as const;

export type { PhotoCategoryDefinition, PhotoSectionDefinition, PhotoSubsectionDefinition } from "@/lib/photos/types";
export { photoMatchesCategory, normalizePhotoCategory };
