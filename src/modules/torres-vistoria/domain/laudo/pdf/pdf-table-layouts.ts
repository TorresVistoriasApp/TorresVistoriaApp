/**
 * Layouts nomeados do pdfmake.
 *
 * O gerador clona o docDefinition com JSON.stringify antes de renderizar.
 * Funções de layout desaparecem nesse clone e o pdfmake volta à grade preta
 * padrão (1pt). Por isso cada tabela usa um nome string; as funções vivem
 * neste mapa, registrado no motor na hora de gerar o blob.
 */
import { PDF_COLOR, PDF_SPACE, PDF_STROKE } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-tokens";
import { PLATE_BORDER, PLATE_BORDER_WIDTH } from "@/modules/torres-vistoria/domain/laudo/mercosul-plate-layout";

export const PDF_LAYOUT = {
  none: "laudoNone",
  data: "laudoData",
  grid: "laudoGrid",
  panel: "laudoPanel",
  photo: "laudoPhoto",
  fields: "laudoFields",
  fieldsDivided: "laudoFieldsDivided",
  metrics: "laudoMetrics",
  code: "laudoCode",
  plate: "laudoPlate",
} as const;

export type PdfLayoutName = (typeof PDF_LAYOUT)[keyof typeof PDF_LAYOUT];

type TableNode = { table: { body: unknown[]; widths: unknown[] } };

const ZERO_PADDING = {
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0,
  paddingBottom: () => 0,
};

export const PDF_TABLE_LAYOUTS = {
  [PDF_LAYOUT.none]: {
    hLineWidth: () => 0,
    vLineWidth: () => 0,
    ...ZERO_PADDING,
  },

  /** Tabela editorial: só filetes horizontais cinza, sem caixa externa no topo. */
  [PDF_LAYOUT.data]: {
    hLineWidth: (rowIndex: number) => (rowIndex === 0 ? 0 : PDF_STROKE.hairline),
    vLineWidth: () => 0,
    hLineColor: () => PDF_COLOR.border,
    vLineColor: () => PDF_COLOR.border,
    fillColor: (rowIndex: number) => (rowIndex === 0 ? PDF_COLOR.surface : null),
    paddingLeft: () => PDF_SPACE.lg,
    paddingRight: () => PDF_SPACE.lg,
    paddingTop: () => PDF_SPACE.sm + 1,
    paddingBottom: () => PDF_SPACE.sm + 1,
  },

  [PDF_LAYOUT.grid]: {
    hLineWidth: () => PDF_STROKE.hairline,
    vLineWidth: () => PDF_STROKE.hairline,
    hLineColor: () => PDF_COLOR.border,
    vLineColor: () => PDF_COLOR.border,
    fillColor: (rowIndex: number) => (rowIndex === 0 ? PDF_COLOR.surface : null),
    paddingLeft: () => PDF_SPACE.lg,
    paddingRight: () => PDF_SPACE.lg,
    paddingTop: () => PDF_SPACE.sm,
    paddingBottom: () => PDF_SPACE.sm,
  },

  [PDF_LAYOUT.panel]: {
    hLineWidth: () => PDF_STROKE.hairline,
    vLineWidth: () => PDF_STROKE.hairline,
    hLineColor: () => PDF_COLOR.border,
    vLineColor: () => PDF_COLOR.border,
    ...ZERO_PADDING,
  },

  [PDF_LAYOUT.photo]: {
    hLineWidth: () => PDF_STROKE.hairline,
    vLineWidth: () => PDF_STROKE.hairline,
    hLineColor: () => PDF_COLOR.border,
    vLineColor: () => PDF_COLOR.border,
    ...ZERO_PADDING,
  },

  [PDF_LAYOUT.fields]: {
    hLineWidth: () => 0,
    vLineWidth: () => 0,
    paddingLeft: (columnIndex: number) => (columnIndex === 0 ? 0 : PDF_SPACE.md),
    paddingRight: () => PDF_SPACE.md,
    paddingTop: () => 0,
    paddingBottom: () => PDF_SPACE.sm,
  },

  [PDF_LAYOUT.fieldsDivided]: {
    hLineWidth: (rowIndex: number) => (rowIndex > 0 ? PDF_STROKE.hairline : 0),
    vLineWidth: () => 0,
    hLineColor: () => PDF_COLOR.border,
    paddingLeft: (columnIndex: number) => (columnIndex === 0 ? 0 : PDF_SPACE.md),
    paddingRight: () => PDF_SPACE.md,
    paddingTop: () => PDF_SPACE.xs,
    paddingBottom: () => PDF_SPACE.sm,
  },

  [PDF_LAYOUT.metrics]: {
    hLineWidth: (rowIndex: number, node: TableNode) =>
      rowIndex === 0 || rowIndex === node.table.body.length ? PDF_STROKE.hairline : 0,
    vLineWidth: (columnIndex: number, node: TableNode) =>
      columnIndex === 0 || columnIndex === node.table.widths.length ? 0 : PDF_STROKE.hairline,
    hLineColor: () => PDF_COLOR.border,
    vLineColor: () => PDF_COLOR.border,
    paddingLeft: (columnIndex: number) => (columnIndex === 0 ? 0 : PDF_SPACE.md),
    paddingRight: () => PDF_SPACE.sm,
    paddingTop: () => PDF_SPACE.sm,
    paddingBottom: () => PDF_SPACE.sm,
  },

  [PDF_LAYOUT.code]: {
    hLineWidth: () => PDF_STROKE.hairline,
    vLineWidth: () => PDF_STROKE.hairline,
    hLineColor: () => PDF_COLOR.border,
    vLineColor: () => PDF_COLOR.border,
    ...ZERO_PADDING,
  },

  [PDF_LAYOUT.plate]: {
    hLineWidth: () => PLATE_BORDER_WIDTH,
    vLineWidth: () => PLATE_BORDER_WIDTH,
    hLineColor: () => PLATE_BORDER,
    vLineColor: () => PLATE_BORDER,
    ...ZERO_PADDING,
  },
} as const;
