import type { IntegrationResult } from "@/core/integrations/ports/shared";

/** Documentos PDF emitidos pelo ecossistema. */
export const PdfDocumentType = {
  INSPECTION_REPORT: "INSPECTION_REPORT",
  CONSULTA_REPORT: "CONSULTA_REPORT",
  FINANCIAL_STATEMENT: "FINANCIAL_STATEMENT",
  INVOICE: "INVOICE",
} as const;
export type PdfDocumentType = (typeof PdfDocumentType)[keyof typeof PdfDocumentType];

export interface PdfRenderRequest {
  type: PdfDocumentType;
  /** Dados já resolvidos: o renderizador não consulta o banco. */
  data: Record<string, unknown>;
  /** Identidade visual do tenant aplicada ao documento. */
  branding?: {
    companyName: string;
    logoUrl: string | null;
    primaryColor: string;
  };
}

export interface RenderedPdf {
  blob: Blob;
  pageCount: number;
  sizeInBytes: number;
}

/**
 * Porta de geração de PDF.
 *
 * Manter isso atrás de um contrato permite mover a renderização do browser para
 * um serviço no servidor sem tocar nas telas — hoje as libs de PDF respondem por
 * boa parte do bundle.
 */
export interface PdfRendererPort {
  render(request: PdfRenderRequest): Promise<IntegrationResult<RenderedPdf>>;
}
