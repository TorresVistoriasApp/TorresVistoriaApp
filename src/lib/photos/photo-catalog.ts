import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Camera,
  Car,
  FileText,
  Gauge,
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
import type { PhotoCategoryDefinition, PhotoCategoryType, PhotoSectionDefinition } from "@/lib/photos/types";
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
    name: input.name,
    description: input.description,
    icon: input.icon ?? Camera,
    sortOrder,
    required: input.required ?? true,
    minCount: input.minCount ?? (type === "SINGLE" ? 1 : 0),
    maxCount: input.maxCount ?? (type === "SINGLE" ? 1 : type === "DAMAGE" ? 50 : type === "COMPLEMENTARY" ? 999 : 10),
    type,
    technicalGuide: resolveTechnicalGuide(input.key, input.name),
    visualGuide: resolveTechnicalGuide(input.key, input.name),
    estimatedCaptureSeconds: 25,
  };
}

function section(
  key: string,
  sortOrder: number,
  name: string,
  description: string,
  icon: LucideIcon,
  categories: PhotoCategoryDefinition[],
  options?: { collapsible?: boolean; defaultOpen?: boolean },
): PhotoSectionDefinition {
  const requiredCategories = categories.filter((c) => c.required && c.type === "SINGLE");
  return {
    key,
    name,
    description,
    icon,
    sortOrder,
    minRequiredCount: requiredCategories.length,
    maxAllowedCount: categories.reduce((sum, c) => sum + c.maxCount, 0),
    categories,
    collapsible: options?.collapsible,
    defaultOpen: options?.defaultOpen ?? true,
  };
}

const DOCUMENTACAO_CATEGORIES = [
  category("DOCUMENTACAO", 1, { key: "DOC_VEICULO", name: "Documento do veículo", description: "Documento principal do veículo legível.", icon: FileText, type: "MULTI", required: false, minCount: 0, maxCount: 5 }),
  category("DOCUMENTACAO", 2, { key: "DOC_CRLV", name: "CRLV", description: "Certificado de Registro e Licenciamento.", icon: FileText, type: "MULTI", required: false, minCount: 0, maxCount: 3 }),
  category("DOCUMENTACAO", 3, { key: "DOC_CRV", name: "CRV", description: "Certificado de Registro de Veículo.", icon: FileText, type: "MULTI", required: false, minCount: 0, maxCount: 3 }),
  category("DOCUMENTACAO", 4, { key: "DOC_ATPV_E", name: "ATPV-e", description: "Autorização para Transferência de Propriedade.", icon: FileText, type: "MULTI", required: false, minCount: 0, maxCount: 3 }),
  category("DOCUMENTACAO", 5, { key: "DOC_OUTROS", name: "Outros documentos", description: "Documentos complementares.", icon: FileText, type: "MULTI", required: false, minCount: 0, maxCount: 10 }),
];

const IDENTIFICACAO_EXTERNA_CATEGORIES = [
  category("IDENTIFICACAO_EXTERNA", 1, { key: "EXT_FRENTE_45_ESQ", name: "Frente 45° esquerda", description: "Ângulo frontal esquerdo do veículo.", icon: Car }),
  category("IDENTIFICACAO_EXTERNA", 2, { key: "EXT_FRENTE_45_DIR", name: "Frente 45° direita", description: "Ângulo frontal direito do veículo.", icon: Car }),
  category("IDENTIFICACAO_EXTERNA", 3, { key: "EXT_FRENTE_COMPLETA", name: "Frente completa", description: "Vista frontal completa.", icon: Car }),
  category("IDENTIFICACAO_EXTERNA", 4, { key: "EXT_LATERAL_ESQ", name: "Lateral esquerda", description: "Lateral completa do lado motorista.", icon: Car }),
  category("IDENTIFICACAO_EXTERNA", 5, { key: "EXT_LATERAL_DIR", name: "Lateral direita", description: "Lateral completa do lado passageiro.", icon: Car }),
  category("IDENTIFICACAO_EXTERNA", 6, { key: "EXT_TRASEIRA_45_ESQ", name: "Traseira 45° esquerda", description: "Ângulo traseiro esquerdo.", icon: Car }),
  category("IDENTIFICACAO_EXTERNA", 7, { key: "EXT_TRASEIRA_45_DIR", name: "Traseira 45° direita", description: "Ângulo traseiro direito.", icon: Car }),
  category("IDENTIFICACAO_EXTERNA", 8, { key: "EXT_TRASEIRA_COMPLETA", name: "Traseira completa", description: "Vista traseira completa.", icon: Car }),
  category("IDENTIFICACAO_EXTERNA", 9, { key: "EXT_PLACA_DIANTEIRA", name: "Placa dianteira", description: "Placa dianteira legível.", icon: Tag }),
  category("IDENTIFICACAO_EXTERNA", 10, { key: "EXT_PLACA_TRASEIRA", name: "Placa traseira", description: "Placa traseira legível.", icon: Tag }),
  category("IDENTIFICACAO_EXTERNA", 11, { key: "EXT_LACRE_PLACA", name: "Lacre da placa", description: "Lacre da placa traseira.", icon: Tag }),
  category("IDENTIFICACAO_EXTERNA", 12, { key: "EXT_CAPO", name: "Capô", description: "Capô fechado, vista superior frontal.", icon: Car }),
  category("IDENTIFICACAO_EXTERNA", 13, { key: "EXT_TETO", name: "Teto", description: "Teto externo do veículo.", icon: Car }),
  category("IDENTIFICACAO_EXTERNA", 14, { key: "EXT_PARACHOQUE_DIANTEIRO", name: "Para-choque dianteiro", description: "Para-choque dianteiro completo.", icon: Car }),
  category("IDENTIFICACAO_EXTERNA", 15, { key: "EXT_PARACHOQUE_TRASEIRO", name: "Para-choque traseiro", description: "Para-choque traseiro completo.", icon: Car }),
  category("IDENTIFICACAO_EXTERNA", 16, { key: "EXT_TAMPA_PORTA_MALAS", name: "Tampa do porta-malas", description: "Tampa do porta-malas fechada.", icon: Car }),
];

const COMPARTIMENTO_MOTOR_CATEGORIES = [
  category("COMPARTIMENTO_MOTOR", 1, { key: "MOT_COMPARTIMENTO", name: "Compartimento do motor", description: "Visão geral do compartimento.", icon: Wrench }),
  category("COMPARTIMENTO_MOTOR", 2, { key: "MOT_NUMERO_MOTOR", name: "Número do motor", description: "Gravação do número do motor.", icon: Wrench }),
  category("COMPARTIMENTO_MOTOR", 3, { key: "MOT_ETIQUETA", name: "Etiqueta do compartimento", description: "Etiqueta de identificação do motor.", icon: Tag }),
  category("COMPARTIMENTO_MOTOR", 4, { key: "MOT_PAINEL_CORTA_FOGO", name: "Painel corta-fogo", description: "Painel corta-fogo e fixações.", icon: Layers }),
  category("COMPARTIMENTO_MOTOR", 5, { key: "MOT_PAINEL_FRONTAL", name: "Painel frontal", description: "Painel frontal e travessas.", icon: Layers }),
  category("COMPARTIMENTO_MOTOR", 6, { key: "MOT_LONGARINA_DIANT_ESQ", name: "Longarina dianteira esquerda", description: "Longarina dianteira esquerda.", icon: Layers }),
  category("COMPARTIMENTO_MOTOR", 7, { key: "MOT_LONGARINA_DIANT_DIR", name: "Longarina dianteira direita", description: "Longarina dianteira direita.", icon: Layers }),
  category("COMPARTIMENTO_MOTOR", 8, { key: "MOT_TORRE_AMORT_ESQ", name: "Torre do amortecedor esquerda", description: "Torre/amortecedor dianteiro esquerdo.", icon: Wrench }),
  category("COMPARTIMENTO_MOTOR", 9, { key: "MOT_TORRE_AMORT_DIR", name: "Torre do amortecedor direita", description: "Torre/amortecedor dianteiro direito.", icon: Wrench }),
];

const ESTRUTURA_TRASEIRA_CATEGORIES = [
  category("ESTRUTURA_TRASEIRA", 1, { key: "TRS_PORTA_MALAS_ABERTO", name: "Porta-malas aberto", description: "Porta-malas aberto, visão geral.", icon: Layers }),
  category("ESTRUTURA_TRASEIRA", 2, { key: "TRS_PAINEL_SUPERIOR", name: "Painel traseiro superior", description: "Painel traseiro superior.", icon: Layers }),
  category("ESTRUTURA_TRASEIRA", 3, { key: "TRS_PAINEL_INFERIOR", name: "Painel traseiro inferior", description: "Painel traseiro inferior.", icon: Layers }),
  category("ESTRUTURA_TRASEIRA", 4, { key: "TRS_LONGARINA_TRASEIRA_ESQ", name: "Longarina traseira esquerda", description: "Longarina traseira esquerda.", icon: Layers }),
  category("ESTRUTURA_TRASEIRA", 5, { key: "TRS_LONGARINA_TRASEIRA_DIR", name: "Longarina traseira direita", description: "Longarina traseira direita.", icon: Layers }),
  category("ESTRUTURA_TRASEIRA", 6, { key: "TRS_PAINEL_ASSOALHO", name: "Painel traseiro com assoalho", description: "Painel traseiro e assoalho.", icon: Layers }),
  category("ESTRUTURA_TRASEIRA", 7, { key: "TRS_CAIXA_ESTEPE", name: "Caixa de estepe", description: "Compartimento do estepe.", icon: Layers }),
  category("ESTRUTURA_TRASEIRA", 8, { key: "TRS_ASSOALHO_PORTA_MALAS", name: "Assoalho do porta-malas", description: "Assoalho do porta-malas.", icon: Layers }),
];

const ESTRUTURA_LATERAL_CATEGORIES = [
  category("ESTRUTURA_LATERAL", 1, { key: "LAT_CAIXA_AR_ESQ", name: "Caixa de ar esquerda", description: "Caixa de ar/soleira esquerda.", icon: Layers }),
  category("ESTRUTURA_LATERAL", 2, { key: "LAT_CAIXA_AR_DIR", name: "Caixa de ar direita", description: "Caixa de ar/soleira direita.", icon: Layers }),
  category("ESTRUTURA_LATERAL", 3, { key: "LAT_QUADRO_PORTA_DIANT_ESQ", name: "Quadro porta dianteira esquerda", description: "Quadro da porta dianteira esquerda (sem borracha).", icon: Layers }),
  category("ESTRUTURA_LATERAL", 4, { key: "LAT_COLUNA_DIANT_ESQ", name: "Coluna dianteira esquerda", description: "Coluna A esquerda.", icon: Layers }),
  category("ESTRUTURA_LATERAL", 5, { key: "LAT_COLUNA_CENTRAL_ESQ", name: "Coluna central esquerda", description: "Coluna B esquerda.", icon: Layers }),
  category("ESTRUTURA_LATERAL", 6, { key: "LAT_QUADRO_PORTA_TRASEIRA_ESQ", name: "Quadro porta traseira esquerda", description: "Quadro da porta traseira esquerda (sem borracha).", icon: Layers }),
  category("ESTRUTURA_LATERAL", 7, { key: "LAT_COLUNA_TRASEIRA_ESQ", name: "Coluna traseira esquerda", description: "Coluna C esquerda.", icon: Layers }),
  category("ESTRUTURA_LATERAL", 8, { key: "LAT_QUADRO_PORTA_DIANT_DIR", name: "Quadro porta dianteira direita", description: "Quadro da porta dianteira direita (sem borracha).", icon: Layers }),
  category("ESTRUTURA_LATERAL", 9, { key: "LAT_COLUNA_DIANT_DIR", name: "Coluna dianteira direita", description: "Coluna A direita.", icon: Layers }),
  category("ESTRUTURA_LATERAL", 10, { key: "LAT_COLUNA_CENTRAL_DIR", name: "Coluna central direita", description: "Coluna B direita.", icon: Layers }),
  category("ESTRUTURA_LATERAL", 11, { key: "LAT_QUADRO_PORTA_TRASEIRA_DIR", name: "Quadro porta traseira direita", description: "Quadro da porta traseira direita (sem borracha).", icon: Layers }),
  category("ESTRUTURA_LATERAL", 12, { key: "LAT_COLUNA_TRASEIRA_DIR", name: "Coluna traseira direita", description: "Coluna C direita.", icon: Layers }),
];

const IDENTIFICACAO_VEICULO_CATEGORIES = [
  category("IDENTIFICACAO_VEICULO", 1, { key: "IDV_NUMERO_CHASSI", name: "Número do chassi", description: "Gravação do chassi legível.", icon: Scan }),
  category("IDENTIFICACAO_VEICULO", 2, { key: "IDV_NUMERO_MOTOR", name: "Número do motor", description: "Gravação do motor legível.", icon: Scan }),
  category("IDENTIFICACAO_VEICULO", 3, { key: "IDV_ETIQUETA_COLUNA_DIR", name: "Etiqueta da coluna direita", description: "Etiqueta de identificação na coluna.", icon: Tag }),
  category("IDENTIFICACAO_VEICULO", 4, { key: "IDV_ETIQUETA_MOTOR", name: "Etiqueta do compartimento", description: "Etiqueta no compartimento do motor.", icon: Tag }),
  category("IDENTIFICACAO_VEICULO", 5, { key: "IDV_GRAVACAO_VIDRO_DIANT", name: "Gravação vidro dianteiro", description: "Gravação no para-brisa.", icon: Scan }),
  category("IDENTIFICACAO_VEICULO", 6, { key: "IDV_GRAVACAO_VIDRO_TRASE", name: "Gravação vidro traseiro", description: "Gravação no vidro traseiro.", icon: Scan }),
  category("IDENTIFICACAO_VEICULO", 7, { key: "IDV_GRAVACAO_VIDRO_LATERAL", name: "Gravação vidro lateral", description: "Gravação em vidro lateral.", icon: Scan }),
];

const INTERIOR_CATEGORIES = [
  category("INTERIOR", 1, { key: "INT_PAINEL_INSTRUMENTOS", name: "Painel de instrumentos", description: "Painel e instrumentos.", icon: LayoutDashboard }),
  category("INTERIOR", 2, { key: "INT_PAINEL_BANCO_TRASEIRO", name: "Painel do banco traseiro", description: "Painel fotografado do banco traseiro.", icon: LayoutDashboard }),
  category("INTERIOR", 3, { key: "INT_HODOMETRO", name: "Hodômetro", description: "Quilometragem visível.", icon: Gauge }),
  category("INTERIOR", 4, { key: "INT_VOLANTE", name: "Volante", description: "Volante e comandos.", icon: LayoutDashboard }),
  category("INTERIOR", 5, { key: "INT_CONSOLE_CENTRAL", name: "Console central", description: "Console central e alavancas.", icon: LayoutDashboard }),
  category("INTERIOR", 6, { key: "INT_BANCOS_DIANTEIROS", name: "Bancos dianteiros", description: "Bancos dianteiros.", icon: LayoutDashboard }),
  category("INTERIOR", 7, { key: "INT_BANCOS_TRASEIROS", name: "Bancos traseiros", description: "Bancos traseiros.", icon: LayoutDashboard }),
  category("INTERIOR", 8, { key: "INT_PORTAS_INTERNAS", name: "Portas internas", description: "Acabamento interno das portas.", icon: LayoutDashboard }),
  category("INTERIOR", 9, { key: "INT_REVESTIMENTOS", name: "Revestimentos internos", description: "Revestimentos e carpetes.", icon: LayoutDashboard }),
];

const SEGURANCA_CATEGORIES = [
  category("SEGURANCA", 1, { key: "SEG_CINTO_DATA", name: "Data do cinto de segurança", description: "Etiqueta de data do cinto.", icon: Shield }),
  category("SEGURANCA", 2, { key: "SEG_AIRBAGS", name: "Airbags", description: "Indicadores e etiquetas de airbag.", icon: Shield }),
  category("SEGURANCA", 3, { key: "SEG_EXTINTOR", name: "Extintor", description: "Extintor de incêndio.", icon: Shield }),
  category("SEGURANCA", 4, { key: "SEG_MACACO", name: "Macaco", description: "Macaco hidráulico ou manual.", icon: Wrench }),
  category("SEGURANCA", 5, { key: "SEG_TRIANGULO", name: "Triângulo", description: "Triângulo de sinalização.", icon: AlertTriangle }),
  category("SEGURANCA", 6, { key: "SEG_CHAVE_RODA", name: "Chave de roda", description: "Chave de roda.", icon: Wrench }),
  category("SEGURANCA", 7, { key: "SEG_ESTEPE", name: "Estepe", description: "Estepe e estado.", icon: Car }),
];

const RODAS_PNEUS_CATEGORIES = [
  category("RODAS_PNEUS", 1, { key: "ROD_DIANT_ESQ", name: "Roda dianteira esquerda", description: "Roda e pneu dianteiro esquerdo.", icon: Car }),
  category("RODAS_PNEUS", 2, { key: "ROD_DIANT_DIR", name: "Roda dianteira direita", description: "Roda e pneu dianteiro direito.", icon: Car }),
  category("RODAS_PNEUS", 3, { key: "ROD_TRASEIRA_ESQ", name: "Roda traseira esquerda", description: "Roda e pneu traseiro esquerdo.", icon: Car }),
  category("RODAS_PNEUS", 4, { key: "ROD_TRASEIRA_DIR", name: "Roda traseira direita", description: "Roda e pneu traseiro direito.", icon: Car }),
  category("RODAS_PNEUS", 5, { key: "ROD_ESTADO_PNEUS", name: "Estado dos pneus", description: "Estado geral dos pneus.", icon: Car }),
  category("RODAS_PNEUS", 6, { key: "ROD_SULCO_PNEUS", name: "Sulco dos pneus", description: "Profundidade do sulco.", icon: Car }),
];

const PINTURA_CATEGORIES = [
  category("PINTURA", 1, { key: "PINT_CAPO", name: "Capô", description: "Evidência de pintura do capô.", icon: Paintbrush }),
  category("PINTURA", 2, { key: "PINT_TETO", name: "Teto", description: "Evidência de pintura do teto.", icon: Paintbrush }),
  category("PINTURA", 3, { key: "PINT_TAMPA_PORTA_MALAS", name: "Tampa do porta-malas", description: "Evidência da tampa do porta-malas.", icon: Paintbrush }),
  category("PINTURA", 4, { key: "PINT_PARALAMA_DIANT_ESQ", name: "Paralama dianteiro esquerdo", description: "Paralama dianteiro esquerdo.", icon: Paintbrush }),
  category("PINTURA", 5, { key: "PINT_PORTA_DIANT_ESQ", name: "Porta dianteira esquerda", description: "Porta dianteira esquerda.", icon: Paintbrush }),
  category("PINTURA", 6, { key: "PINT_PORTA_TRASEIRA_ESQ", name: "Porta traseira esquerda", description: "Porta traseira esquerda.", icon: Paintbrush }),
  category("PINTURA", 7, { key: "PINT_LATERAL_TRASEIRA_ESQ", name: "Lateral traseira esquerda", description: "Lateral traseira esquerda.", icon: Paintbrush }),
  category("PINTURA", 8, { key: "PINT_LATERAL_TRASEIRA_DIR", name: "Lateral traseira direita", description: "Lateral traseira direita.", icon: Paintbrush }),
  category("PINTURA", 9, { key: "PINT_PORTA_TRASEIRA_DIR", name: "Porta traseira direita", description: "Porta traseira direita.", icon: Paintbrush }),
  category("PINTURA", 10, { key: "PINT_PORTA_DIANT_DIR", name: "Porta dianteira direita", description: "Porta dianteira direita.", icon: Paintbrush }),
  category("PINTURA", 11, { key: "PINT_PARALAMA_DIANT_DIR", name: "Paralama dianteiro direito", description: "Paralama dianteiro direito.", icon: Paintbrush }),
  category("PINTURA", 12, { key: "PINT_PARACHOQUE_DIANTEIRO", name: "Para-choque dianteiro", description: "Para-choque dianteiro.", icon: Paintbrush }),
  category("PINTURA", 13, { key: "PINT_PARACHOQUE_TRASEIRO", name: "Para-choque traseiro", description: "Para-choque traseiro.", icon: Paintbrush }),
  category("PINTURA", 14, { key: "PINT_MEDIDOR_ESPESSURA", name: "Medidor de espessura", description: "Fotos com medidor de espessura.", icon: Paintbrush, type: "MULTI", required: false, minCount: 0, maxCount: 20 }),
  category("PINTURA", 15, { key: "PINT_CANETA_TESTE", name: "Caneta teste de pintura", description: "Fotos com caneta teste.", icon: Paintbrush, type: "MULTI", required: false, minCount: 0, maxCount: 20 }),
];

const AVARIAS_CATEGORIES = [
  category("AVARIAS", 1, {
    key: "AVARIA",
    name: "Registro de avaria",
    description: "Fotografe cada avaria com localização e gravidade.",
    icon: AlertTriangle,
    type: "DAMAGE",
    required: false,
    minCount: 0,
    maxCount: 50,
  }),
];

const COMPLEMENTARES_CATEGORIES = [
  category("COMPLEMENTARES", 1, {
    key: "COMPLEMENTAR",
    name: "Foto complementar",
    description: "Fotos adicionais com nome e categoria opcional.",
    icon: Plus,
    type: "COMPLEMENTARY",
    required: false,
    minCount: 0,
    maxCount: 999,
  }),
];

/** Catálogo principal — fonte única de verdade para UI, validação e PDF. */
export const PHOTO_CATALOG: PhotoSectionDefinition[] = [
  section("DOCUMENTACAO", 1, "Documentação", "Capture os documentos do veículo. Múltiplas fotos permitidas.", FileText, DOCUMENTACAO_CATEGORIES, { collapsible: true, defaultOpen: true }),
  section("IDENTIFICACAO_EXTERNA", 2, "Identificação externa", "Fotos externas padronizadas para identificação do veículo.", Car, IDENTIFICACAO_EXTERNA_CATEGORIES),
  section("COMPARTIMENTO_MOTOR", 3, "Compartimento do motor", "Evidências do compartimento do motor e estrutura dianteira.", Wrench, COMPARTIMENTO_MOTOR_CATEGORIES),
  section("ESTRUTURA_TRASEIRA", 4, "Estrutura traseira", "Estrutura traseira, porta-malas e assoalho.", Layers, ESTRUTURA_TRASEIRA_CATEGORIES),
  section("ESTRUTURA_LATERAL", 5, "Estrutura lateral", "Colunas, quadros de porta e caixas de ar.", Layers, ESTRUTURA_LATERAL_CATEGORIES),
  section("IDENTIFICACAO_VEICULO", 6, "Identificação do veículo", "Numerações, etiquetas e gravações de vidro.", Scan, IDENTIFICACAO_VEICULO_CATEGORIES),
  section("INTERIOR", 7, "Interior", "Painel, bancos, revestimentos e hodômetro.", LayoutDashboard, INTERIOR_CATEGORIES),
  section("SEGURANCA", 8, "Segurança", "Itens obrigatórios de segurança e equipamentos.", Shield, SEGURANCA_CATEGORIES),
  section("RODAS_PNEUS", 9, "Rodas e pneus", "Rodas, pneus e profundidade de sulco.", Car, RODAS_PNEUS_CATEGORIES),
  section("PINTURA", 10, "Pintura", "Evidências de pintura por peça e testes.", Paintbrush, PINTURA_CATEGORIES),
  section("AVARIAS", 11, "Avarias", "Registre cada avaria com metadados. Até 50 fotos.", AlertTriangle, AVARIAS_CATEGORIES, { collapsible: true, defaultOpen: true }),
  section("COMPLEMENTARES", 12, "Fotos complementares", "Fotos extras organizadas automaticamente no laudo.", Plus, COMPLEMENTARES_CATEGORIES, { collapsible: true, defaultOpen: false }),
];

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

/** Categorias de pintura (single-slot obrigatórias). */
export const PAINT_PHOTO_CATEGORY_KEYS = PINTURA_CATEGORIES.filter(
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

export type { PhotoCategoryDefinition, PhotoSectionDefinition } from "@/lib/photos/types";
export { photoMatchesCategory, normalizePhotoCategory };
