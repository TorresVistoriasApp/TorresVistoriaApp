import { PHOTO_CATALOG } from "@/modules/torres-vistoria/domain/photos/photo-catalog";
import {
  groupPhotosBySection,
  selectFeaturedVehiclePhotos,
} from "@/modules/torres-vistoria/domain/photos/pdf-photo-layout";
import { formatDate, formatDocument, formatPhone } from "@/shared/lib/formatters";
import { formatChecklistObservationForPdf } from "@/modules/torres-vistoria/domain/checklist/checklist-issue-options";
import {
  getChecklistStatusPdfColor,
  getChecklistStatusPdfLabel,
  getChecklistStatusShortLabel,
} from "@/modules/torres-vistoria/domain/checklist/checklist-status";
import { ChecklistStatus } from "@/modules/torres-vistoria/domain/enums";
import {
  buildInspectionInfoRows,
  buildSaleMarketInfoRows,
  buildVehicleInfoRows,
  hasLaudoValue,
  hasSaleMarketSectionData,
} from "@/modules/torres-vistoria/domain/laudo/laudo-field-utils";
import { buildCoverPlatePdfNode } from "@/modules/torres-vistoria/domain/laudo/mercosul-plate-pdf";
import {
  getLaudoLegalParagraphs,
  type LaudoPayload,
} from "@/modules/torres-vistoria/domain/laudo/laudo-model";
import { summarizeVerificationCode } from "@/modules/torres-vistoria/domain/laudo/verification-code";
import {
  PDF_AUTHENTICITY,
  PDF_COLOR,
  PDF_COVER,
  PDF_FONT,
  PDF_LINE_HEIGHT,
  PDF_PAGE,
  PDF_SPACE,
  PDF_TRACKING,
  toneColor,
  type PdfNode,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-tokens";
import {
  bulletList,
  codeBlock,
  dataTableLayout,
  kpiCardRow,
  labelValueBlock,
  labelValueGrid,
  panel,
  resultBadge,
  ruleNode,
  sectionBar,
  statusLabel,
  subsectionHeading,
  tableHeaderCell,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-primitives";
import {
  buildChartLegendNode,
  buildDonutChartNode,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-charts";
import {
  buildFeaturedPhotoGrid,
  buildPhotoGrid,
} from "@/modules/torres-vistoria/domain/laudo/pdf/photo-grid";
import {
  buildLaudoReportViewModel,
  type LaudoReportViewModel,
} from "@/modules/torres-vistoria/domain/laudo/pdf/laudo-report-view-model";
import { buildPaintSilhouetteNode } from "@/modules/torres-vistoria/domain/laudo/pdf/paint-silhouette";

const EMPTY_VALUE = "Não informado";
const LEGAL_HEADINGS = [
  "Natureza da vistoria cautelar",
  "Validade das informações",
  "Responsabilidade da plataforma",
  "Financiamento e seguro",
];

function value(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return EMPTY_VALUE;
  return String(v);
}

function checklistStatusDisplay(status: string): string {
  if (status === ChecklistStatus.NAO_CONFORME) return getChecklistStatusShortLabel(status);
  return getChecklistStatusPdfLabel(status);
}

function brandIdentity(payload: LaudoPayload, primaryColor: string): PdfNode {
  return {
    stack: [
      payload.logoDataUrl
        ? {
            image: payload.logoDataUrl,
            fit: [PDF_COVER.logoWidth, PDF_COVER.logoHeight],
            margin: [0, 0, 0, PDF_SPACE.sm],
          }
        : {
            text: "Torres Vistoria",
            fontSize: PDF_FONT.h2,
            bold: true,
            color: primaryColor,
            margin: [0, 0, 0, PDF_SPACE.sm],
          },
      {
        text: "LAUDO CAUTELAR VEICULAR",
        fontSize: PDF_FONT.micro,
        color: PDF_COLOR.muted,
        characterSpacing: PDF_TRACKING.wider,
        margin: [0, PDF_SPACE.sm, 0, 0],
      },
      {
        text: `Nº ${payload.laudoNumber}`,
        fontSize: PDF_FONT.h1,
        bold: true,
        color: PDF_COLOR.navy,
        margin: [0, 3, 0, 0],
      },
      {
        text: `Emitido em ${formatDate(payload.generatedAt)}`,
        fontSize: PDF_FONT.micro,
        color: PDF_COLOR.muted,
        margin: [0, 3, 0, 0],
      },
    ],
  };
}

function coverQrColumn(payload: LaudoPayload): PdfNode {
  const qrValue = payload.validationUrl || payload.verificationCode;
  return {
    width: PDF_COVER.qrSize + 8,
    stack: [
      { qr: qrValue, fit: PDF_COVER.qrSize, alignment: "right" },
      {
        text: payload.verificationCode,
        fontSize: PDF_FONT.micro,
        color: PDF_COLOR.muted,
        alignment: "right",
        characterSpacing: PDF_TRACKING.tight,
        margin: [0, 3, 0, 0],
      },
    ],
  };
}

function vehicleFactCards(inspection: LaudoPayload["inspection"]): PdfNode {
  const facts: [string, string][] = [
    ["Marca / Modelo", `${inspection.brand} / ${inspection.model}`],
    ["Ano", `${inspection.manufacture_year} / ${inspection.model_year}`],
    ["Cor", inspection.color],
    ["Combustível", inspection.fuel],
  ];

  return {
    table: {
      widths: ["*", "*", "*", "*"],
      body: [facts.map(([label, content]) => labelValueBlock(label, content))],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: (columnIndex: number) => (columnIndex === 0 ? 0 : PDF_SPACE.md),
      paddingRight: () => PDF_SPACE.sm,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
    margin: [0, PDF_SPACE.md, 0, 0],
  };
}

function buildCover(payload: LaudoPayload, view: LaudoReportViewModel): PdfNode[] {
  const inspection = payload.inspection;
  const accent = toneColor(view.opinionTone);

  return [
    {
      canvas: [{ type: "rect", x: 0, y: 0, w: PDF_PAGE.contentWidth, h: 3, color: PDF_COLOR.navy }],
      margin: [0, 0, 0, PDF_SPACE.md],
    },
    {
      columns: [brandIdentity(payload, view.primaryColor), { width: "*", text: "" }, coverQrColumn(payload)],
      columnGap: PDF_SPACE.lg,
    },
    ruleNode(PDF_PAGE.contentWidth, { margin: [0, PDF_SPACE.lg, 0, PDF_SPACE.md] }),
    subsectionHeading("Identificação do veículo", { accent: view.primaryColor, margin: [0, 0, 0, PDF_SPACE.md] }),
    buildCoverPlatePdfNode(inspection.plate, inspection),
    vehicleFactCards(inspection),
    subsectionHeading("Resultado da vistoria", {
      accent,
      margin: [0, PDF_SPACE.xl, 0, PDF_SPACE.md],
    }),
    resultBadge(view.opinionLabel, {
      accent,
      width: PDF_PAGE.contentWidth,
      height: 34,
    }),
  ];
}

function buildIndicatorSection(view: LaudoReportViewModel): PdfNode[] {
  const firstRow = view.indicators.slice(0, 3);
  const secondRow = view.indicators.slice(3);

  return [
    sectionBar("Resumo da vistoria", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
      kicker: "Indicadores calculados a partir do checklist técnico desta vistoria.",
    }),
    kpiCardRow(firstRow, { width: PDF_PAGE.contentWidth, margin: [0, 0, 0, PDF_SPACE.md] }),
    kpiCardRow(secondRow, { width: PDF_PAGE.contentWidth, margin: [0, 0, 0, 0] }),
  ];
}

function chartCard(
  title: string,
  caption: string,
  slices: LaudoReportViewModel["checklistDistribution"],
  centerValue: string,
  centerLabel: string,
): PdfNode {
  return panel(
    [
      {
        text: title.toUpperCase(),
        fontSize: PDF_FONT.micro,
        bold: true,
        color: PDF_COLOR.navy,
        characterSpacing: PDF_TRACKING.wide,
      },
      {
        text: caption,
        fontSize: PDF_FONT.micro,
        color: PDF_COLOR.muted,
        margin: [0, 2, 0, PDF_SPACE.md],
      },
      {
        columns: [
          buildDonutChartNode(slices, {
            size: 102,
            centerValue,
            centerLabel,
          }),
          {
            width: "*",
            ...buildChartLegendNode(slices, { includeEmpty: true, showPercentage: true }),
            margin: [PDF_SPACE.md, 8, 0, 0],
          },
        ],
        columnGap: PDF_SPACE.sm,
      },
    ],
    { padding: PDF_SPACE.lg },
  );
}

function buildChartsSection(view: LaudoReportViewModel): PdfNode[] {
  if (view.stats.total === 0) return [];

  const checklistCard = chartCard(
    "Resultado do checklist",
    "Proporção real dos status registrados na vistoria.",
    view.checklistDistribution,
    String(view.stats.total),
    "itens",
  );

  const hasCategoryChart = view.categoryDistribution.some((slice) => slice.value > 0);
  if (!hasCategoryChart) {
    return [
      subsectionHeading("Indicadores e gráficos", {
        accent: view.primaryColor,
        margin: [0, PDF_SPACE.xl, 0, PDF_SPACE.md],
      }),
      checklistCard,
    ];
  }

  const categoryCard = chartCard(
    view.categoryDistributionTitle,
    view.categoryDistributionCaption,
    view.categoryDistribution,
    String(view.categoryDistribution.reduce((sum, slice) => sum + slice.value, 0)),
    "registros",
  );

  const gap = PDF_SPACE.md;
  const cardWidth = Math.floor((PDF_PAGE.contentWidth - gap) / 2);

  return [
    subsectionHeading("Indicadores e gráficos", {
      accent: view.primaryColor,
      margin: [0, PDF_SPACE.xl, 0, PDF_SPACE.md],
    }),
    {
      table: {
        widths: [cardWidth, gap, cardWidth],
        body: [[checklistCard, { text: "" }, categoryCard]],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
    },
  ];
}

function buildBrandLogoCell(brand: string, brandLogoDataUrl?: string): PdfNode {
  const caption = {
    text: "Marca do veículo",
    alignment: "center" as const,
    fontSize: PDF_FONT.micro,
    color: PDF_COLOR.muted,
  };

  return panel(
    [
      brandLogoDataUrl
        ? {
            image: brandLogoDataUrl,
            width: 72,
            height: 36,
            alignment: "center",
            margin: [0, PDF_SPACE.sm, 0, PDF_SPACE.sm],
          }
        : {
            text: brand || "Marca",
            alignment: "center",
            bold: true,
            color: PDF_COLOR.navy,
            fontSize: PDF_FONT.h1,
            margin: [0, PDF_SPACE.lg, 0, PDF_SPACE.sm],
          },
      caption,
    ],
    { padding: PDF_SPACE.md, fill: PDF_COLOR.surface },
  );
}

function buildInspectionDataSection(
  payload: LaudoPayload,
  view: LaudoReportViewModel,
): PdfNode[] {
  const rows = buildInspectionInfoRows(
    payload.inspection,
    payload.company,
    formatDate,
    formatPhone,
    formatDocument,
  );
  const grid = labelValueGrid(rows, { columns: 3, margin: [0, PDF_SPACE.md, 0, 0] });
  if (!grid) return [];

  return [
    sectionBar("Dados da vistoria", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
    }),
    grid,
  ];
}

function buildVehicleDataSection(payload: LaudoPayload, view: LaudoReportViewModel): PdfNode[] {
  const grid = labelValueGrid(buildVehicleInfoRows(payload.inspection), {
    columns: 3,
    margin: [0, 0, 0, 0],
  });

  return [
    sectionBar("Dados do veículo", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
    }),
    {
      table: {
        widths: [108, "*"],
        body: [
          [
            buildBrandLogoCell(payload.inspection.brand, payload.brandLogoDataUrl),
            grid ?? { text: "" },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: (columnIndex: number) => (columnIndex === 0 ? 0 : PDF_SPACE.lg),
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
      margin: [0, 0, 0, PDF_SPACE.md],
    },
  ];
}

function buildFeaturedPhotos(payload: LaudoPayload, view: LaudoReportViewModel): PdfNode[] {
  const featured = selectFeaturedVehiclePhotos(payload.photos);
  if (featured.length === 0) return [];

  return [
    subsectionHeading("Registro de identificação", {
      accent: view.primaryColor,
      description: "Enquadramentos de destaque do veículo vistoriado.",
      margin: [0, PDF_SPACE.md, 0, PDF_SPACE.md],
    }),
    ...buildFeaturedPhotoGrid(featured, {
      accent: view.primaryColor,
      contentWidth: PDF_PAGE.contentWidth,
    }),
  ];
}

function buildSaleMarketSection(
  inspection: LaudoPayload["inspection"],
  view: LaudoReportViewModel,
): PdfNode[] {
  if (!hasSaleMarketSectionData(inspection)) return [];
  const rows = buildSaleMarketInfoRows(inspection);
  const grid = labelValueGrid(rows, { columns: 3, margin: [0, PDF_SPACE.md, 0, 0] });
  if (!grid) return [];

  return [
    sectionBar("Venda, justiça e mercado", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
    }),
    grid,
  ];
}

function buildChecklistSection(view: LaudoReportViewModel): PdfNode[] {
  if (view.categories.length === 0) {
    return [
      sectionBar("Checklist técnico", {
        accent: view.primaryColor,
        width: PDF_PAGE.contentWidth,
      }),
      { text: "Nenhum item de checklist registrado nesta vistoria.", color: PDF_COLOR.muted },
    ];
  }

  const nodes: PdfNode[] = [
    sectionBar("Checklist técnico", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
      kicker: "Todos os itens avaliados, com o status e as observações registrados na vistoria.",
    }),
  ];

  for (const category of view.categories) {
    const rows = category.items.map((item) => {
      const observation = formatChecklistObservationForPdf(item.status, item.notes);
      const isApontamento = item.status === ChecklistStatus.NAO_CONFORME;

      return [
        { text: item.item_name, fontSize: PDF_FONT.body, color: PDF_COLOR.text },
        statusLabel(checklistStatusDisplay(item.status).toUpperCase(), getChecklistStatusPdfColor(item.status)),
        {
          text: observation || "—",
          fontSize: PDF_FONT.body,
          color: isApontamento && observation ? "#92400e" : PDF_COLOR.text,
          bold: Boolean(isApontamento && observation),
        },
      ];
    });

    nodes.push(
      subsectionHeading(category.label, {
        accent: view.primaryColor,
        description: `${category.total} itens · ${category.naoConforme} apontamento(s)`,
        margin: [0, PDF_SPACE.lg, 0, PDF_SPACE.sm],
      }),
      {
        table: {
          headerRows: 1,
          widths: ["42%", "24%", "34%"],
          body: [
            [
              tableHeaderCell("Item"),
              tableHeaderCell("Status"),
              tableHeaderCell("Observação"),
            ],
            ...rows,
          ],
        },
        layout: dataTableLayout(),
        margin: [0, 0, 0, PDF_SPACE.sm],
      },
    );
  }

  return nodes;
}

function buildPhotoSection(payload: LaudoPayload, view: LaudoReportViewModel): PdfNode[] {
  const featuredIds = new Set(selectFeaturedVehiclePhotos(payload.photos).map((photo) => photo.id));
  const photos = payload.photos;

  if (photos.length === 0) {
    return [
      sectionBar("Registro fotográfico", {
        accent: view.primaryColor,
        width: PDF_PAGE.contentWidth,
      }),
      { text: "Nenhuma foto registrada para esta vistoria.", color: PDF_COLOR.muted },
    ];
  }

  const grouped = groupPhotosBySection(photos, { excludePhotoIds: featuredIds });
  const nodes: PdfNode[] = [
    sectionBar("Registro fotográfico", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
      kicker: `${view.photoCount} fotografia(s) incorporada(s) a este laudo.`,
    }),
  ];

  for (const section of PHOTO_CATALOG) {
    const sectionPhotos = grouped.get(section.key);
    if (!sectionPhotos?.length) continue;

    nodes.push(
      subsectionHeading(section.name, {
        accent: view.primaryColor,
        description: section.description,
        margin: [0, PDF_SPACE.lg, 0, PDF_SPACE.md],
      }),
      ...buildPhotoGrid(sectionPhotos, {
        accent: view.primaryColor,
        contentWidth: PDF_PAGE.contentWidth,
      }),
    );
  }

  return nodes;
}

function buildPaintSection(view: LaudoReportViewModel, payload: LaudoPayload): PdfNode[] {
  if (!view.hasPaintAnalysisData) return [];

  const nodes: PdfNode[] = [
    sectionBar("Análise de pintura e estrutura", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
      kicker: "Indicadores baseados apenas em registros fotográficos e itens de pintura desta vistoria.",
    }),
    buildPaintSilhouetteNode(view.paintZones, payload.vehicleTopViewDataUrl),
  ];

  if (view.paintChecklistItems.length > 0) {
    nodes.push(
      subsectionHeading("Itens de pintura do checklist", {
        accent: view.primaryColor,
        margin: [0, PDF_SPACE.xl, 0, PDF_SPACE.sm],
      }),
      {
        table: {
          headerRows: 1,
          widths: ["46%", "24%", "30%"],
          body: [
            [tableHeaderCell("Item"), tableHeaderCell("Status"), tableHeaderCell("Observação")],
            ...view.paintChecklistItems.map((item) => {
              const observation = formatChecklistObservationForPdf(item.status, item.notes);
              return [
                { text: item.item_name, fontSize: PDF_FONT.body },
                statusLabel(
                  checklistStatusDisplay(item.status).toUpperCase(),
                  getChecklistStatusPdfColor(item.status),
                ),
                { text: observation || "—", fontSize: PDF_FONT.body, color: PDF_COLOR.text },
              ];
            }),
          ],
        },
        layout: dataTableLayout(),
      },
    );
  }

  return nodes;
}

function buildOpinionSection(
  inspection: LaudoPayload["inspection"],
  view: LaudoReportViewModel,
): PdfNode[] {
  const notes = inspection.technical_notes?.trim();
  if (!hasLaudoValue(notes)) return [];

  return [
    sectionBar("Parecer técnico", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
      kicker: "Conclusão registrada pelo vistoriador responsável.",
    }),
    panel(
      [
        {
          text: notes,
          fontSize: PDF_FONT.bodyLarge,
          color: PDF_COLOR.text,
          lineHeight: PDF_LINE_HEIGHT.relaxed,
          alignment: "justify",
        },
      ],
      { fill: PDF_COLOR.surface, padding: PDF_SPACE.xl },
    ),
  ];
}

function buildConclusionSection(view: LaudoReportViewModel): PdfNode[] {
  return [
    sectionBar("Conclusão da vistoria", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
    }),
    resultBadge(view.opinionLabel, {
      accent: toneColor(view.opinionTone),
      width: PDF_PAGE.contentWidth,
      height: 30,
    }),
    subsectionHeading("Resumo", {
      accent: view.primaryColor,
      margin: [0, PDF_SPACE.lg, 0, PDF_SPACE.md],
    }),
    bulletList(view.conclusionHighlights, { color: view.primaryColor }),
  ];
}

function buildAuthenticitySection(payload: LaudoPayload, view: LaudoReportViewModel): PdfNode[] {
  const qrValue = payload.validationUrl || payload.verificationCode;
  const inspector = payload.inspector;

  return [
    sectionBar("Autenticidade do laudo", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
      kicker: "Documento verificável na plataforma Torres. O hash identifica esta emissão.",
    }),
    {
      unbreakable: true,
      columns: [
        {
          width: PDF_AUTHENTICITY.qrSize + 12,
          stack: [
            { qr: qrValue, fit: PDF_AUTHENTICITY.qrSize },
            {
              text: "QR de validação",
              fontSize: PDF_FONT.micro,
              color: PDF_COLOR.muted,
              alignment: "center",
              margin: [0, PDF_SPACE.sm, 0, 0],
            },
          ],
        },
        {
          width: "*",
          stack: [
            labelValueBlock("Código de autenticidade", payload.verificationCode, {
              valueSize: PDF_FONT.h2,
              valueColor: PDF_COLOR.navy,
              margin: [0, 0, 0, PDF_SPACE.md],
            }),
            {
              text: "HASH DO DOCUMENTO",
              fontSize: PDF_FONT.micro,
              color: PDF_COLOR.muted,
              characterSpacing: PDF_TRACKING.normal,
              margin: [0, 0, 0, PDF_SPACE.xs],
            },
            codeBlock(payload.integrityHash, { fontSize: PDF_FONT.micro }),
            {
              text: payload.validationUrl || "Disponível pelo código do laudo na plataforma Torres.",
              fontSize: PDF_FONT.small,
              color: PDF_COLOR.muted,
              margin: [0, PDF_SPACE.md, 0, 0],
            },
            ...(inspector?.full_name
              ? [
                  labelValueBlock("Vistoriador responsável", inspector.full_name, {
                    margin: [0, PDF_SPACE.lg, 0, 0],
                  }),
                  ...(inspector.credential
                    ? [
                        {
                          text: inspector.credential,
                          fontSize: PDF_FONT.micro,
                          color: PDF_COLOR.muted,
                          margin: [0, 2, 0, 0],
                        },
                      ]
                    : []),
                ]
              : []),
          ],
        },
      ],
      columnGap: PDF_SPACE.xl,
    },
  ];
}

function buildLegalSection(view: LaudoReportViewModel): PdfNode[] {
  const paragraphs = getLaudoLegalParagraphs();

  return [
    sectionBar("Informações jurídicas", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
    }),
    ...paragraphs.map((paragraph, index) => ({
      stack: [
        {
          text: (LEGAL_HEADINGS[index] ?? `Informativo ${index + 1}`).toUpperCase(),
          fontSize: PDF_FONT.micro,
          bold: true,
          color: PDF_COLOR.navy,
          characterSpacing: PDF_TRACKING.wide,
          margin: [0, index === 0 ? 0 : PDF_SPACE.lg, 0, PDF_SPACE.sm],
        },
        {
          text: paragraph,
          fontSize: PDF_FONT.body,
          alignment: "justify" as const,
          color: PDF_COLOR.text,
          lineHeight: PDF_LINE_HEIGHT.relaxed,
        },
      ],
    })),
  ];
}

function buildSignatureRow(payload: LaudoPayload): PdfNode {
  const company = payload.company;
  return {
    columns: [
      {
        stack: [
          {
            text: "EMPRESA RESPONSÁVEL",
            fontSize: PDF_FONT.micro,
            color: PDF_COLOR.muted,
            characterSpacing: PDF_TRACKING.wide,
          },
          {
            text: value(company?.name?.trim() || "Torres Vistoria"),
            bold: true,
            fontSize: PDF_FONT.bodyLarge,
            color: PDF_COLOR.navy,
            margin: [0, PDF_SPACE.sm, 0, 0],
          },
          ...(company?.document
            ? [{ text: formatDocument(company.document), fontSize: PDF_FONT.small, color: PDF_COLOR.muted }]
            : []),
        ],
      },
      {
        stack: [
          {
            text: "VALIDAÇÃO PÚBLICA",
            fontSize: PDF_FONT.micro,
            color: PDF_COLOR.muted,
            alignment: "right",
            characterSpacing: PDF_TRACKING.wide,
          },
          {
            text: payload.validationUrl || "Disponível pelo código do laudo",
            fontSize: PDF_FONT.small,
            alignment: "right",
            color: PDF_COLOR.text,
            margin: [0, PDF_SPACE.sm, 0, 0],
          },
        ],
      },
    ],
    margin: [0, PDF_SPACE.xl, 0, 0],
  };
}

export function buildLaudoDocDefinition(payload: LaudoPayload): Record<string, unknown> {
  const view = buildLaudoReportViewModel(payload);
  const company = payload.company;
  const issuedAt = formatDate(payload.generatedAt);
  const codeSummary = summarizeVerificationCode(payload.verificationCode);
  const footerBrand = company?.name?.trim() || "Torres Vistoria";

  const content: PdfNode[] = [
    ...buildCover(payload, view),
    ...buildIndicatorSection(view),
    ...buildChartsSection(view),
    ...buildInspectionDataSection(payload, view),
    ...buildVehicleDataSection(payload, view),
    ...buildFeaturedPhotos(payload, view),
    ...buildSaleMarketSection(payload.inspection, view),
    ...buildChecklistSection(view),
    ...buildPhotoSection(payload, view),
    ...buildPaintSection(view, payload),
    ...buildOpinionSection(payload.inspection, view),
    ...buildConclusionSection(view),
    ...buildAuthenticitySection(payload, view),
    ...buildLegalSection(view),
    buildSignatureRow(payload),
  ];

  return {
    pageSize: PDF_PAGE.size,
    pageMargins: PDF_PAGE.margins,
    content,
    footer: (currentPage: number, pageCount: number) => ({
      stack: [
        {
          canvas: [
            {
              type: "line",
              x1: PDF_PAGE.margins[0],
              y1: 0,
              x2: 559,
              y2: 0,
              lineWidth: 0.5,
              lineColor: PDF_COLOR.border,
            },
          ],
        },
        {
          columns: [
            {
              text: `${footerBrand} · ${payload.laudoNumber} · ${codeSummary} · ${issuedAt}`,
              fontSize: PDF_FONT.micro,
              color: PDF_COLOR.muted,
              margin: [PDF_PAGE.margins[0], 6, 8, 0],
            },
            {
              text: `Página ${currentPage} de ${pageCount}`,
              fontSize: PDF_FONT.micro,
              color: PDF_COLOR.muted,
              alignment: "right",
              margin: [0, 6, PDF_PAGE.margins[2], 0],
            },
          ],
        },
      ],
    }),
    defaultStyle: {
      fontSize: PDF_FONT.body,
      color: PDF_COLOR.text,
    },
  };
}
