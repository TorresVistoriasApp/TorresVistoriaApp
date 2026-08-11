/**
 * Apontamentos contextuais por item do checklist.
 * Códigos estáveis para UI/persistência; labels legíveis no laudo (via notes).
 */

import { CHECKLIST_CATALOG } from "@/modules/torres-vistoria/domain/checklist/checklist-catalog";

export type ChecklistIssueOption = {
  code: string;
  label: string;
};

/** Separador entre apontamentos rápidos e observação manual em `notes`. */
export const CHECKLIST_ISSUE_MANUAL_SEPARATOR = " — ";

function opt(code: string, label: string): ChecklistIssueOption {
  return { code, label };
}

/** Conjuntos reutilizáveis — relevância > quantidade (~3–5 por item). */
const ISSUE_SETS = {
  estrutura: [
    opt("amassada", "Amassada"),
    opt("reparada", "Reparada"),
    opt("soldada", "Soldada"),
    opt("trincada", "Trincada"),
    opt("substituida", "Substituída"),
  ],
  estruturaMasculino: [
    opt("amassado", "Amassado"),
    opt("reparado", "Reparado"),
    opt("soldado", "Soldado"),
    opt("trincado", "Trincado"),
    opt("substituido", "Substituído"),
  ],
  assoalho: [
    opt("amassado", "Amassado"),
    opt("reparado", "Reparado"),
    opt("soldado", "Soldado"),
    opt("trincado", "Trincado"),
    opt("corroido", "Corroído"),
  ],
  torres: [
    opt("deformada", "Deformada"),
    opt("soldada", "Soldada"),
    opt("reparada", "Reparada"),
    opt("substituida", "Substituída"),
    opt("originalidade_comprometida", "Originalidade comprometida"),
  ],
  caixaAr: [
    opt("amassada", "Amassada"),
    opt("corroida", "Corroída"),
    opt("reparada", "Reparada"),
    opt("soldada", "Soldada"),
    opt("deformada", "Deformada"),
  ],
  teto: [
    opt("amassado", "Amassado"),
    opt("riscado", "Riscado"),
    opt("repintado", "Repintado"),
    opt("reparado", "Reparado"),
    opt("com_massa", "Com massa"),
  ],
  pinturaGeral: [
    opt("amassada", "Amassada"),
    opt("riscada", "Riscada"),
    opt("queimada", "Queimada"),
    opt("repintada", "Repintada"),
    opt("com_massa", "Com massa"),
  ],
  repinturaLocalizada: [
    opt("area_identificada", "Área identificada"),
    opt("espessura_irregular", "Espessura irregular"),
    opt("com_massa", "Com massa"),
    opt("tom_divergente", "Tom divergente"),
    opt("qualidade_irregular", "Qualidade irregular"),
  ],
  repinturaTotal: [
    opt("repintura_completa", "Repintura completa"),
    opt("com_massa", "Com massa"),
    opt("tom_divergente", "Tom divergente"),
    opt("qualidade_irregular", "Qualidade irregular"),
    opt("motivo_nao_esclarecido", "Motivo não esclarecido"),
  ],
  massaPlastica: [
    opt("massa_excessiva", "Massa excessiva"),
    opt("area_estrutural", "Área estrutural"),
    opt("irregularidade", "Irregularidade"),
    opt("espessura_excessiva", "Espessura excessiva"),
  ],
  corrosao: [
    opt("corrosao_ativa", "Corrosão ativa"),
    opt("oxidacao_superficial", "Oxidação superficial"),
    opt("perfurante", "Perfurante"),
    opt("tratada", "Tratada"),
    opt("avancada", "Avançada"),
  ],
  alinhamento: [
    opt("desalinhado", "Desalinhado"),
    opt("folga_irregular", "Folga irregular"),
    opt("painel_substituido", "Painel substituído"),
    opt("reparo_aparente", "Reparo aparente"),
  ],
  vidros: [
    opt("trincado", "Trincado"),
    opt("quebrado", "Quebrado"),
    opt("substituido", "Substituído"),
    opt("gravacao_divergente", "Gravação divergente"),
    opt("pelicula", "Película"),
  ],
  etiquetasContran: [
    opt("ausente", "Ausente"),
    opt("ilegivel", "Ilegível"),
    opt("divergente", "Divergente"),
    opt("substituida", "Substituída"),
    opt("nao_conforme", "Não conforme"),
  ],
  gravacao: [
    opt("ilegivel", "Ilegível"),
    opt("adulterada", "Adulterada"),
    opt("local_divergente", "Local divergente"),
    opt("solda_aparente", "Solda aparente"),
    opt("divergente_cadastro", "Divergente do cadastro"),
  ],
  etiquetaId: [
    opt("ausente", "Ausente"),
    opt("ilegivel", "Ilegível"),
    opt("divergente", "Divergente"),
    opt("substituida", "Substituída"),
  ],
  plaquetas: [
    opt("ausente", "Ausente"),
    opt("ilegivel", "Ilegível"),
    opt("divergente", "Divergente"),
    opt("substituida", "Substituída"),
    opt("nao_original", "Não original"),
  ],
  placa: [
    opt("danificada", "Danificada"),
    opt("ilegivel", "Ilegível"),
    opt("fixacao_irregular", "Fixação irregular"),
    opt("padrao_divergente", "Padrão divergente"),
  ],
  hodometro: [
    opt("leitura_inconsistente", "Leitura inconsistente"),
    opt("funcionamento_irregular", "Funcionamento irregular"),
    opt("indicio_adulteracao", "Indício de adulteração"),
    opt("display_danificado", "Display danificado"),
  ],
  freios: [
    opt("vazamento", "Vazamento"),
    opt("desgaste_excessivo", "Desgaste excessivo"),
    opt("ruido_anormal", "Ruído anormal"),
    opt("falha_aparente", "Falha aparente"),
    opt("reparo_recente", "Reparo recente"),
  ],
  suspensao: [
    opt("folga_excessiva", "Folga excessiva"),
    opt("vazamento", "Vazamento"),
    opt("componente_danificado", "Componente danificado"),
    opt("ruido_anormal", "Ruído anormal"),
    opt("reparo_aparente", "Reparo aparente"),
  ],
  direcao: [
    opt("folga", "Folga"),
    opt("ruido_anormal", "Ruído anormal"),
    opt("desalinhamento", "Desalinhamento"),
    opt("vazamento", "Vazamento"),
    opt("reparo_aparente", "Reparo aparente"),
  ],
  pneus: [
    opt("desgastado", "Desgastado"),
    opt("ressecado", "Ressecado"),
    opt("danificado", "Danificado"),
    opt("medida_divergente", "Medida divergente"),
    opt("desgaste_irregular", "Desgaste irregular"),
  ],
  iluminacao: [
    opt("nao_funciona", "Não funciona"),
    opt("quebrado", "Quebrado"),
    opt("trincado", "Trincado"),
    opt("opacidade", "Opacidade"),
    opt("substituicao_irregular", "Substituição irregular"),
  ],
  cintos: [
    opt("desgastado", "Desgastado"),
    opt("danificado", "Danificado"),
    opt("travamento_irregular", "Travamento irregular"),
    opt("data_divergente", "Data divergente"),
    opt("substituido", "Substituído"),
  ],
  eletrica: [
    opt("fiacao_exposta", "Fiação exposta"),
    opt("curto_aparente", "Curto aparente"),
    opt("alteracao_irregular", "Alteração irregular"),
    opt("bateria_danificada", "Bateria danificada"),
    opt("oxidacao", "Oxidação"),
  ],
  escapamento: [
    opt("vazamento", "Vazamento"),
    opt("solto", "Solto"),
    opt("ausente", "Ausente"),
    opt("danificado", "Danificado"),
    opt("substituicao_irregular", "Substituição irregular"),
  ],
  lataria: [
    opt("amassada", "Amassada"),
    opt("riscada", "Riscada"),
    opt("reparada", "Reparada"),
    opt("repintada", "Repintada"),
    opt("com_massa", "Com massa"),
  ],
  portasCapo: [
    opt("amassado", "Amassado"),
    opt("riscado", "Riscado"),
    opt("desalinhado", "Desalinhado"),
    opt("reparado", "Reparado"),
    opt("repintado", "Repintado"),
  ],
  farois: [
    opt("trincado", "Trincado"),
    opt("quebrado", "Quebrado"),
    opt("opaco", "Opaco"),
    opt("solto", "Solto"),
    opt("substituido", "Substituído"),
  ],
  parachoque: [
    opt("riscado", "Riscado"),
    opt("trincado", "Trincado"),
    opt("quebrado", "Quebrado"),
    opt("reparado", "Reparado"),
    opt("repintado", "Repintado"),
  ],
  documento: [
    opt("ausente", "Ausente"),
    opt("dados_divergentes", "Dados divergentes"),
    opt("ilegivel", "Ilegível"),
    opt("vencido", "Vencido"),
    opt("inconsistente", "Inconsistente"),
  ],
  conformidade: [
    opt("divergencia_chassi", "Divergência de chassi"),
    opt("divergencia_motor", "Divergência de motor"),
    opt("divergencia_renavam", "Divergência de Renavam"),
    opt("dados_incompativeis", "Dados incompatíveis"),
  ],
} as const satisfies Record<string, ChecklistIssueOption[]>;

type IssueSetKey = keyof typeof ISSUE_SETS;

/**
 * Mapa item → conjunto de apontamentos.
 * Chave: `${category}::${item_name}` (igual ao sync do catálogo).
 */
const ITEM_ISSUE_SET: Record<string, IssueSetKey> = {
  "ESTRUTURA::Longarina dianteira": "estrutura",
  "ESTRUTURA::Longarina traseira": "estrutura",
  "ESTRUTURA::Coluna A (dianteira)": "estrutura",
  "ESTRUTURA::Coluna B (central)": "estrutura",
  "ESTRUTURA::Coluna C (traseira)": "estrutura",
  "ESTRUTURA::Painel dianteiro": "estruturaMasculino",
  "ESTRUTURA::Painel traseiro": "estruturaMasculino",
  "ESTRUTURA::Assoalho / tanque": "assoalho",
  "ESTRUTURA::Torres de amarração": "torres",
  "ESTRUTURA::Caixa de ar / soleira": "caixaAr",
  "ESTRUTURA::Teto / vigia": "teto",

  "PINTURA::Pintura original de fábrica": "pinturaGeral",
  "PINTURA::Repintura localizada": "repinturaLocalizada",
  "PINTURA::Repintura total": "repinturaTotal",
  "PINTURA::Repintura com massa plástica": "massaPlastica",
  "PINTURA::Corrosão / oxidação": "corrosao",
  "PINTURA::Alinhamento de painéis": "alinhamento",

  "VIDROS::Para-brisa": "vidros",
  "VIDROS::Vidros laterais dianteiros": "vidros",
  "VIDROS::Vidros laterais traseiros": "vidros",
  "VIDROS::Vidro traseiro": "vidros",
  "VIDROS::Etiquetas CONTRAN nos vidros": "etiquetasContran",

  "IDENTIFICACAO::Gravação do chassi": "gravacao",
  "IDENTIFICACAO::Gravação do motor": "gravacao",
  "IDENTIFICACAO::Etiqueta de identificação (porta)": "etiquetaId",
  "IDENTIFICACAO::Etiqueta de identificação (assoalho)": "etiquetaId",
  "IDENTIFICACAO::Plaquetas automotivas": "plaquetas",
  "IDENTIFICACAO::Placa dianteira": "placa",
  "IDENTIFICACAO::Placa traseira": "placa",
  "IDENTIFICACAO::Hodômetro / quilometragem": "hodometro",

  "MECANICA::Sistema de freios": "freios",
  "MECANICA::Suspensão dianteira": "suspensao",
  "MECANICA::Suspensão traseira": "suspensao",
  "MECANICA::Direção": "direcao",
  "MECANICA::Pneus (estado e medida)": "pneus",
  "MECANICA::Iluminação e sinalização": "iluminacao",
  "MECANICA::Cintos de segurança": "cintos",

  "ELETRICA::Bateria e sistema elétrico": "eletrica",
  "ELETRICA::Escapamento / catalisador": "escapamento",

  "LATARIA::Lataria externa (avarias)": "lataria",
  "LATARIA::Portas, capô e porta-malas": "portasCapo",
  "LATARIA::Faróis, lanternas e retrovisores": "farois",
  "LATARIA::Para-choques dianteiro e traseiro": "parachoque",

  "DOCUMENTACAO::Conferência CRLV / CRV": "documento",
  "DOCUMENTACAO::Conformidade Renavam × chassi × motor": "conformidade",
};

function itemKey(category: string, itemName: string): string {
  return `${category}::${itemName}`;
}

/** Opções de apontamento para um item do catálogo (vazio se item desconhecido). */
export function getChecklistIssueOptions(
  category: string,
  itemName: string,
): readonly ChecklistIssueOption[] {
  const setKey = ITEM_ISSUE_SET[itemKey(category, itemName)];
  return setKey ? ISSUE_SETS[setKey] : [];
}

export function getChecklistIssueLabel(
  category: string,
  itemName: string,
  code: string,
): string | undefined {
  return getChecklistIssueOptions(category, itemName).find((o) => o.code === code)?.label;
}

export type ChecklistIssueNotesParts = {
  issueCodes: string[];
  manualObservation: string;
};

/**
 * Monta o texto persistido em `inspection_checklists.notes`.
 * Ex.: "Amassada; Reparada — Reparo na região central."
 */
export function formatChecklistIssueNotes(
  category: string,
  itemName: string,
  issueCodes: readonly string[],
  manualObservation?: string | null,
): string | null {
  const options = getChecklistIssueOptions(category, itemName);
  const byCode = new Map(options.map((o) => [o.code, o.label]));
  const labels = issueCodes
    .map((code) => byCode.get(code))
    .filter((label): label is string => Boolean(label));

  const issuesText = labels.join("; ");
  const manual = manualObservation?.trim() ?? "";

  if (!issuesText && !manual) return null;
  if (!issuesText) return manual;
  if (!manual) return issuesText;
  return `${issuesText}${CHECKLIST_ISSUE_MANUAL_SEPARATOR}${manual}`;
}

/**
 * Interpreta `notes` gravadas (chips + observação manual, ou texto legado livre).
 * Códigos reconhecidos voltam em `issueCodes`; o restante fica em `manualObservation`.
 */
export function parseChecklistIssueNotes(
  category: string,
  itemName: string,
  notes: string | null | undefined,
): ChecklistIssueNotesParts {
  const raw = notes?.trim() ?? "";
  if (!raw) return { issueCodes: [], manualObservation: "" };

  const options = getChecklistIssueOptions(category, itemName);
  if (options.length === 0) {
    return { issueCodes: [], manualObservation: raw };
  }

  const labelToCode = new Map(options.map((o) => [o.label.toLowerCase(), o.code]));

  let issuesPart = raw;
  let manualObservation = "";

  const sepIndex = raw.indexOf(CHECKLIST_ISSUE_MANUAL_SEPARATOR);
  if (sepIndex >= 0) {
    issuesPart = raw.slice(0, sepIndex).trim();
    manualObservation = raw.slice(sepIndex + CHECKLIST_ISSUE_MANUAL_SEPARATOR.length).trim();
  }

  const tokens = issuesPart
    .split(";")
    .map((t) => t.trim())
    .filter(Boolean);

  const issueCodes: string[] = [];
  const unmatched: string[] = [];

  for (const token of tokens) {
    const code = labelToCode.get(token.toLowerCase());
    if (code) issueCodes.push(code);
    else unmatched.push(token);
  }

  // Texto legado ou parcial: tokens não reconhecidos viram observação manual.
  if (unmatched.length > 0) {
    const leftover = unmatched.join("; ");
    manualObservation = manualObservation
      ? `${leftover}${CHECKLIST_ISSUE_MANUAL_SEPARATOR}${manualObservation}`
      : leftover;
  }

  // Se nenhum chip bateu e não havia separador, trata tudo como observação manual.
  if (issueCodes.length === 0 && sepIndex < 0) {
    return { issueCodes: [], manualObservation: raw };
  }

  return { issueCodes, manualObservation };
}

/** Conteúdo suficiente para validar "Aprovado com apontamento". */
export function hasChecklistIssueContent(notes: string | null | undefined): boolean {
  return Boolean(notes?.trim());
}

/**
 * Texto da coluna "Observação técnica" no PDF.
 * Sem notes: célula vazia (não inventa "Sem observação").
 */
export function formatChecklistObservationForPdf(
  _status: string,
  notes: string | null | undefined,
): string {
  return notes?.trim() ?? "";
}

/** Garante cobertura 1:1 com o catálogo (útil em testes). */
export function listChecklistItemsMissingIssueOptions(): string[] {
  const missing: string[] = [];
  for (const category of CHECKLIST_CATALOG) {
    for (const item of category.items) {
      const key = itemKey(category.key, item.name);
      if (!ITEM_ISSUE_SET[key]) missing.push(key);
    }
  }
  return missing;
}
