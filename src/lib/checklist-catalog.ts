/**
 * Catálogo técnico de vistoria veicular cautelar/pericial.
 * Parâmetros alinhados a laudos para DETRAN, seguradoras e uso judicial.
 */
import { ChecklistStatus } from "@/lib/enums";
export type ChecklistCatalogItem = {
  name: string;
  /** Critério de avaliação exibido ao vistoriador. */
  criteria: string;
  /** Observação obrigatória quando marcado como não conforme. */
  requiresNoteOnNonConform?: boolean;
};

export type ChecklistCatalogCategory = {
  key: string;
  label: string;
  description: string;
  items: ChecklistCatalogItem[];
};

export const CHECKLIST_CATALOG: ChecklistCatalogCategory[] = [
  {
    key: "ESTRUTURA",
    label: "Estrutura e Longarinas",
    description: "Integridade estrutural, critério decisivo em perícias e transferências.",
    items: [
      { name: "Longarina dianteira", criteria: "Sem deformação, solda irregular ou reparo estrutural.", requiresNoteOnNonConform: true },
      { name: "Longarina traseira", criteria: "Sem deformação, solda irregular ou reparo estrutural.", requiresNoteOnNonConform: true },
      { name: "Coluna A (dianteira)", criteria: "Sem amassado, corte, solda ou substituição não original.", requiresNoteOnNonConform: true },
      { name: "Coluna B (central)", criteria: "Sem amassado, corte, solda ou substituição não original.", requiresNoteOnNonConform: true },
      { name: "Coluna C (traseira)", criteria: "Sem amassado, corte, solda ou substituição não original.", requiresNoteOnNonConform: true },
      { name: "Painel dianteiro", criteria: "Sem deformação, reparo ou substituição indevida.", requiresNoteOnNonConform: true },
      { name: "Painel traseiro", criteria: "Sem deformação, reparo ou substituição indevida.", requiresNoteOnNonConform: true },
      { name: "Assoalho / tanque", criteria: "Sem corrosão perfurante, deformação ou reparo estrutural.", requiresNoteOnNonConform: true },
      { name: "Torres de amarração", criteria: "Pontos originais de fixação preservados.", requiresNoteOnNonConform: true },
      { name: "Caixa de ar / soleira", criteria: "Sem deformação, corrosão severa ou reparo.", requiresNoteOnNonConform: true },
      { name: "Teto / vigia", criteria: "Sem deformação, reparo ou substituição não original.", requiresNoteOnNonConform: true },
    ],
  },
  {
    key: "PINTURA",
    label: "Pintura e Acabamento",
    description: "Espessura, repintura e indícios de reparo oculto.",
    items: [
      { name: "Pintura original de fábrica", criteria: "Acabamento uniforme, sem indícios de repintura." },
      { name: "Repintura localizada", criteria: "Área repintada identificada e documentada.", requiresNoteOnNonConform: true },
      { name: "Repintura total", criteria: "Repintura completa identificada. Registre o motivo.", requiresNoteOnNonConform: true },
      { name: "Repintura com massa plástica", criteria: "Ausência de massa excessiva em áreas estruturais.", requiresNoteOnNonConform: true },
      { name: "Corrosão / oxidação", criteria: "Sem corrosão ativa em áreas visíveis e estruturais.", requiresNoteOnNonConform: true },
      { name: "Alinhamento de painéis", criteria: "Folgas e encaixes dentro do padrão de fábrica." },
    ],
  },
  {
    key: "VIDROS",
    label: "Vidros e Etiquetas",
    description: "Originalidade e conformidade com normas CONTRAN.",
    items: [
      { name: "Para-brisa", criteria: "Sem trinca, delaminação ou substituição não homologada.", requiresNoteOnNonConform: true },
      { name: "Vidros laterais dianteiros", criteria: "Integridade e marcação original quando aplicável." },
      { name: "Vidros laterais traseiros", criteria: "Integridade e marcação original quando aplicável." },
      { name: "Vidro traseiro", criteria: "Sem trinca, delaminação ou substituição não homologada." },
      { name: "Etiquetas CONTRAN nos vidros", criteria: "Etiquetas legíveis e compatíveis com o veículo.", requiresNoteOnNonConform: true },
    ],
  },
  {
    key: "IDENTIFICACAO",
    label: "Identificação Veicular",
    description: "Numerações e plaquetas exigidas pelo DETRAN e perícia judicial.",
    items: [
      { name: "Gravação do chassi", criteria: "Legível, íntegra, no local original e sem indícios de adulteração.", requiresNoteOnNonConform: true },
      { name: "Gravação do motor", criteria: "Legível, íntegra e compatível com o cadastro.", requiresNoteOnNonConform: true },
      { name: "Etiqueta de identificação (porta)", criteria: "Presente, legível e compatível com o veículo." },
      { name: "Etiqueta de identificação (assoalho)", criteria: "Presente, legível e compatível com o veículo." },
      { name: "Plaquetas automotivas", criteria: "Plaquetas originais presentes e legíveis.", requiresNoteOnNonConform: true },
      { name: "Placa dianteira", criteria: "Fixação correta, legível e padrão Mercosul." },
      { name: "Placa traseira", criteria: "Fixação correta, legível e padrão Mercosul." },
      { name: "Hodômetro / quilometragem", criteria: "Funcionamento e leitura compatível com o estado do veículo.", requiresNoteOnNonConform: true },
    ],
  },
  {
    key: "MECANICA",
    label: "Mecânica e Segurança",
    description: "Itens de segurança ativa e passiva exigidos em vistorias.",
    items: [
      { name: "Sistema de freios", criteria: "Funcionamento adequado, sem vazamentos ou falhas evidentes.", requiresNoteOnNonConform: true },
      { name: "Suspensão dianteira", criteria: "Sem folgas excessivas, vazamentos ou componentes danificados." },
      { name: "Suspensão traseira", criteria: "Sem folgas excessivas, vazamentos ou componentes danificados." },
      { name: "Direção", criteria: "Sem folgas, ruídos anormais ou desalinhamento." },
      { name: "Pneus (estado e medida)", criteria: "Sulco mínimo legal e medida conforme cadastro.", requiresNoteOnNonConform: true },
      { name: "Iluminação e sinalização", criteria: "Faróis, lanternas e setas funcionando corretamente." },
      { name: "Cintos de segurança", criteria: "Todos os cintos presentes e em funcionamento." },
    ],
  },
  {
    key: "ELETRICA",
    label: "Elétrica e Emissões",
    description: "Sistemas elétricos e escapamento.",
    items: [
      { name: "Bateria e sistema elétrico", criteria: "Sem curto, fiação exposta ou alterações irregulares." },
      { name: "Escapamento / catalisador", criteria: "Presente, fixado e sem vazamentos evidentes." },
    ],
  },
  {
    key: "LATARIA",
    label: "Lataria e Componentes Externos",
    description: "Estado geral da carroceria e acessórios externos.",
    items: [
      { name: "Lataria externa (avarias)", criteria: "Avarias visíveis registradas e documentadas.", requiresNoteOnNonConform: true },
      { name: "Portas, capô e porta-malas", criteria: "Abertura, fechamento e alinhamento corretos." },
      { name: "Faróis, lanternas e retrovisores", criteria: "Fixação e integridade dos componentes." },
      { name: "Para-choques dianteiro e traseiro", criteria: "Fixação correta, sem trincas ou substituição indevida." },
    ],
  },
  {
    key: "DOCUMENTACAO",
    label: "Documentação e Conformidade",
    description: "Conferência cadastral para transferência e uso judicial.",
    items: [
      { name: "Conferência CRLV / CRV", criteria: "Documento apresentado e dados compatíveis com o veículo.", requiresNoteOnNonConform: true },
      { name: "Conformidade Renavam × chassi × motor", criteria: "Numerações conferem com a base do DETRAN.", requiresNoteOnNonConform: true },
    ],
  },
];

/** Mapa legado category → nomes dos itens (usado no seed do banco). */
export const CHECKLIST_CATEGORIES = Object.fromEntries(
  CHECKLIST_CATALOG.map((cat) => [cat.key, cat.items.map((i) => i.name)]),
) as Record<string, string[]>;

export const CHECKLIST_CATEGORY_ORDER = CHECKLIST_CATALOG.map((c) => c.key);

export function getChecklistCategoryLabel(key: string): string {
  return CHECKLIST_CATALOG.find((c) => c.key === key)?.label ?? key.replace(/_/g, " ");
}

export function getChecklistItemCriteria(category: string, itemName: string): string | undefined {
  const cat = CHECKLIST_CATALOG.find((c) => c.key === category);
  return cat?.items.find((i) => i.name === itemName)?.criteria;
}

export function getChecklistItemMeta(category: string, itemName: string): ChecklistCatalogItem | undefined {
  const cat = CHECKLIST_CATALOG.find((c) => c.key === category);
  return cat?.items.find((i) => i.name === itemName);
}

export function getExpectedChecklistCount(): number {
  return CHECKLIST_CATALOG.reduce((sum, cat) => sum + cat.items.length, 0);
}

export function buildChecklistSeedRows(companyId: string, inspectionId: string) {
  return CHECKLIST_CATALOG.flatMap((category) =>
    category.items.map((item) => ({
      company_id: companyId,
      inspection_id: inspectionId,
      category: category.key,
      item_name: item.name,
      status: "PENDENTE" as const,
    })),
  );
}

const STATUS_LABELS: Record<string, string> = {
  [ChecklistStatus.PENDENTE]: "Pendente",
  [ChecklistStatus.CONFORME]: "Conforme",
  [ChecklistStatus.NAO_CONFORME]: "Não conforme",
  [ChecklistStatus.NA]: "Não se aplica",
};

export function getChecklistStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}
