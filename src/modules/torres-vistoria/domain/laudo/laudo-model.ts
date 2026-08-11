import type { ChecklistItem } from "@/modules/torres-vistoria/services/checklist-service";
import type { Inspection } from "@/modules/torres-vistoria/services/inspection-service";
import type { InspectionPhoto } from "@/modules/torres-vistoria/services/photo-service";
import { ChecklistStatus } from "@/modules/torres-vistoria/domain/enums";
import { getInspectionOpinionLabel } from "@/modules/torres-vistoria/domain/inspection-opinion-labels";
import { formatDocument } from "@/shared/lib/formatters";

export type LaudoCompany = {
  name?: string | null;
  document?: string | null;
  phone?: string | null;
  email?: string | null;
  logo_url?: string | null;
  address?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
};

export type LaudoSettings = {
  legal_footer?: string | null;
  signature_image_url?: string | null;
  watermark_enabled?: boolean | null;
};

export type LaudoInspector = {
  full_name?: string | null;
  role?: string | null;
  credential?: string | null;
};

export type LaudoPhoto = InspectionPhoto & {
  label?: string;
  dataUrl?: string;
};

export type LaudoPayload = {
  inspection: Inspection;
  checklist: ChecklistItem[];
  photos: LaudoPhoto[];
  company?: LaudoCompany | null;
  settings?: LaudoSettings | null;
  inspector?: LaudoInspector | null;
  /** Número sequencial legível no PDF (TV-2026-000148). */
  laudoNumber: string;
  /** Código opaco usado no QR e na URL /validar. */
  verificationCode: string;
  integrityHash: string;
  validationUrl?: string;
  logoDataUrl?: string;
  brandLogoDataUrl?: string;
  generatedAt: Date;
};

export type ChecklistStats = {
  total: number;
  evaluated: number;
  conforme: number;
  naoConforme: number;
  naoAplicavel: number;
  pendente: number;
  riskLevel: "BAIXO" | "MEDIO" | "ALTO";
};

export function summarizeLaudoChecklist(items: ChecklistItem[]): ChecklistStats {
  const total = items.length;
  const conforme = items.filter((item) => item.status === ChecklistStatus.CONFORME).length;
  const naoConforme = items.filter((item) => item.status === ChecklistStatus.NAO_CONFORME).length;
  const naoAplicavel = items.filter((item) => item.status === ChecklistStatus.NA).length;
  const pendente = items.filter((item) => item.status === ChecklistStatus.PENDENTE).length;
  const evaluated = total - pendente;
  const riskLevel = naoConforme >= 4 ? "ALTO" : naoConforme > 0 ? "MEDIO" : "BAIXO";

  return { total, evaluated, conforme, naoConforme, naoAplicavel, pendente, riskLevel };
}

export function getOpinionLabel(opinion: string | null | undefined): string {
  return getInspectionOpinionLabel(opinion);
}

/**
 * Identidade jurídica da plataforma (licenciadora do sistema).
 * Preencher `PLATFORM_LEGAL_CNPJ` quando o CNPJ da TORRES VISTORIAS estiver disponível.
 */
export const PLATFORM_LEGAL_NAME = "TORRES VISTORIAS";
export const PLATFORM_LEGAL_CNPJ: string | null = null;

function platformLegalLabel(): string {
  if (!PLATFORM_LEGAL_CNPJ?.trim()) return PLATFORM_LEGAL_NAME;
  return `${PLATFORM_LEGAL_NAME}, inscrita no CNPJ sob o nº ${formatDocument(PLATFORM_LEGAL_CNPJ)}`;
}

/**
 * Texto do INFORMATIVO JURÍDICO do laudo.
 * Sempre usa o texto padrão da plataforma (não depende de `settings.legal_footer`,
 * para evitar que um rodapé curto do tenant substitua o informativo completo).
 */
export function getLaudoLegalFooter(): string {
  const platform = platformLegalLabel();
  const platformShort = PLATFORM_LEGAL_NAME;

  return [
    `A vistoria cautelar, ora apresentada, é realizada por vistoriador habilitado da empresa contratante deste sistema licenciado pela ${platform}, sendo certo que o mesmo possui competência técnica para verificar avarias externas e alterações estruturais do veículo em análise, sem qualquer ajuste de peças ou manuseio do veículo. Todas as fotografias, informações, apontamentos técnicos e o conteúdo atestado neste laudo são de inteira e exclusiva responsabilidade do vistoriador responsável pela vistoria. Não se atribui à presente vistoria cautelar a natureza de substituto de "Perícia Oficial Criminal" e/ou de qualquer laudo emitido por instituição oficial.`,
    `As informações prestadas e atestadas na presente vistoria cautelar são válidas apenas para o momento de realização da vistoria. Neste sentido, a empresa contratante do sistema e a ${platformShort} não se responsabilizam por qualquer alteração eventualmente realizada no veículo, após a emissão desta vistoria cautelar.`,
    `A ${platformShort} é responsável apenas pela disponibilização do sistema e pela transmissão das informações colhidas em sua base de dados, uma vez que o conteúdo da vistoria é inserido pelo vistoriador e, quando aplicável, informações complementares podem ser obtidas junto a bancos de dados públicos e privados, não possuindo a ${platformShort} qualquer ingerência, condições e capacidade técnica para inserção, alteração e/ou exclusão de tais informações, sejam elas negativas ou positivas sobre o veículo. Portanto, a ${platformShort} é mera licenciadora do sistema e replicadora das informações constantes da base e dos bancos de dados públicos e privados consultados, não havendo qualquer responsabilidade quanto às fotos, laudo técnico, inclusão, alteração e/ou exclusão de dados sobre os veículos vistoriados ou consultados.`,
    `Na hipótese de a presente vistoria cautelar ser utilizada para fins de contrato de financiamento e/ou de seguro, cumpre-se informar que as instituições financeiras e companhias de seguro adotam métodos e critérios próprios para a aceitação — ou não — de veículos, não se destinando a presente vistoria cautelar para aceite ou recusa por parte das referidas instituições.`,
  ].join("\n\n");
}

/** Parágrafos do informativo jurídico para renderização no PDF. */
export function getLaudoLegalParagraphs(): string[] {
  return getLaudoLegalFooter()
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function getPrimaryColor(company?: LaudoCompany | null): string {
  return company?.primary_color || "#ea580c";
}

