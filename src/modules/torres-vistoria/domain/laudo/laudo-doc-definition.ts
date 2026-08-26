/**
 * Definição visual do laudo PDF Torres Vistoria.
 *
 * DNA (referência editorial):
 *   [ícone grande] Título + subtítulo
 *   ┌─ barra colorida (laranja Torres) ─┐
 *   │ conteúdo                          │
 *   └───────────────────────────────────┘
 */
import { PHOTO_CATALOG } from "@/modules/torres-vistoria/domain/photos/photo-catalog";
import { groupPhotosBySection } from "@/modules/torres-vistoria/domain/photos/pdf-photo-layout";
import { formatDate, formatDocument, formatPhone, formatPlate } from "@/shared/lib/formatters";
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
  inspectionText,
} from "@/modules/torres-vistoria/domain/laudo/laudo-field-utils";
import { buildCoverPlatePdfNode } from "@/modules/torres-vistoria/domain/laudo/mercosul-plate-pdf";
import {
  getLaudoLegalParagraphs,
  type LaudoPayload,
} from "@/modules/torres-vistoria/domain/laudo/laudo-model";
import {
  PDF_AUTHENTICITY,
  PDF_COLOR,
  PDF_COVER,
  PDF_FONT,
  PDF_LINE_HEIGHT,
  PDF_PAGE,
  PDF_SECTION,
  PDF_SPACE,
  PDF_STROKE,
  PDF_TRACKING,
  toneColor,
  type PdfNode,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-tokens";
import {
  attentionBanner,
  bulletList,
  codeBlock,
  dataTableLayout,
  findingRow,
  labelValueBlock,
  metricRow,
  resultBadge,
  statusBadge,
  subsectionHeading,
  tableHeaderCell,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-primitives";
import {
  premiumContentWidth,
  premiumKvGrid,
  premiumMetaChip,
  premiumSection,
  premiumSectionBody,
  premiumSectionLead,
  setActiveSectionIcons,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-premium-section";
import { buildConsultaSections } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-consulta-slots";
import { buildPhotoGrid } from "@/modules/torres-vistoria/domain/laudo/pdf/photo-grid";
import {
  buildLaudoReportViewModel,
  type LaudoReportViewModel,
} from "@/modules/torres-vistoria/domain/laudo/pdf/laudo-report-view-model";
import { buildPaintSilhouetteNode } from "@/modules/torres-vistoria/domain/laudo/pdf/paint-silhouette";
import {
  buildChartLegendNode,
  buildDonutChartNode,
  buildStackedBarNode,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-charts";
import { resolveVehicleOrigin } from "@/modules/torres-vistoria/domain/laudo/pdf/vehicle-origin";
import { brazilFlagIcon } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-icons";

const EMPTY_VALUE = "Não informado";
const LEGAL_HEADINGS = [
  "Natureza da vistoria",
  "Validade das informações",
  "Responsabilidades",
  "Financiamento e seguro",
];
const INNER_WIDTH = premiumContentWidth(PDF_PAGE.contentWidth);

function value(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return EMPTY_VALUE;
  return String(v);
}

function checklistStatusDisplay(status: string): string {
  if (status === ChecklistStatus.NAO_CONFORME) return getChecklistStatusShortLabel(status);
  return getChecklistStatusPdfLabel(status);
}

function coverQrColumn(payload: LaudoPayload): PdfNode {
  const qrValue = payload.validationUrl || payload.verificationCode;
  return {
    width: PDF_COVER.qrSize + 4,
    stack: [
      { qr: qrValue, fit: PDF_COVER.qrSize, alignment: "right" },
      {
        text: "Valide este laudo",
        fontSize: PDF_FONT.micro,
        color: PDF_COLOR.muted,
        alignment: "right",
        margin: [0, 2, 0, 0],
      },
    ],
  };
}

function coverSummaryMetrics(view: LaudoReportViewModel): PdfNode {
  const items = [
    view.indicators[0],
    view.indicators[1],
    view.indicators[2],
    view.indicators[5],
  ].filter(Boolean) as LaudoReportViewModel["indicators"];

  if (view.stats.naoAplicavel > 0 && view.indicators[3]) items.push(view.indicators[3]);
  if (view.stats.pendente > 0 && view.indicators[4]) items.push(view.indicators[4]);

  return metricRow(
    items.map((item) => ({ label: item.label, value: item.value, accent: item.accent })),
    { margin: [0, PDF_SPACE.md, 0, 0] },
  );
}

function attentionBody(): string {
  const validity = getLaudoLegalParagraphs()[1] ?? getLaudoLegalParagraphs()[0] ?? "";
  const sentence = validity.match(/^.*?[.]/)?.[0]?.trim();
  return sentence || validity;
}

function buildCover(payload: LaudoPayload, view: LaudoReportViewModel): PdfNode[] {
  const inspection = payload.inspection;
  const accent = toneColor(view.opinionTone);
  const year = `${inspection.manufacture_year} / ${inspection.model_year}`;
  const when = `${formatDate(inspection.inspection_date)} às ${inspection.inspection_time.slice(0, 5)}`;
  const meta = [year, inspection.color, value(inspection.location), when].filter(Boolean).join("  ·  ");

  return [
    {
      columns: [
        {
          width: "*",
          stack: [
            {
              text: `${inspection.brand} / ${inspection.model}`,
              fontSize: PDF_FONT.display,
              bold: true,
              color: PDF_COLOR.navy,
              lineHeight: PDF_LINE_HEIGHT.tight,
            },
            {
              text: payload.laudoNumber,
              fontSize: PDF_FONT.small,
              bold: true,
              color: view.primaryColor,
              margin: [0, 2, 0, 0],
            },
            {
              text: meta,
              fontSize: PDF_FONT.small,
              color: PDF_COLOR.muted,
              margin: [0, 3, 0, 0],
            },
            {
              text: "RESULTADO",
              fontSize: PDF_FONT.micro,
              color: PDF_COLOR.muted,
              characterSpacing: PDF_TRACKING.wider,
              margin: [0, PDF_SPACE.lg, 0, 3],
            },
            resultBadge(view.opinionLabel, {
              accent,
              tone: view.opinionTone,
              width: PDF_PAGE.contentWidth,
            }),
          ],
        },
        {
          width: "auto",
          stack: [
            buildCoverPlatePdfNode(inspection.plate, inspection),
            { ...coverQrColumn(payload), margin: [0, PDF_SPACE.sm, 0, 0] },
          ],
        },
      ],
      columnGap: PDF_SPACE.lg,
    },
    coverSummaryMetrics(view),
    attentionBanner("Atenção", attentionBody(), {
      width: PDF_PAGE.contentWidth,
      accent: view.primaryColor,
      margin: [0, PDF_SPACE.md, 0, 0],
    }),
  ];
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
  const grid = premiumKvGrid(rows, { columns: 2 });
  if (!grid) return [];

  return [
    premiumSection({
      icon: "inspection",
      title: "Dados da vistoria",
      subtitle: "Identificação do atendimento, contratante e local da inspeção.",
      barLabel: "Atendimento",
      barIcon: "inspection",
      accent: view.primaryColor,
      margin: [0, PDF_SECTION.gap + 4, 0, 0],
      children: [grid],
    }),
  ];
}

function buildVehicleDetailRows(inspection: LaudoPayload["inspection"]): [string, string][] {
  return buildVehicleInfoRows(inspection).filter(
    ([label]) => !["Placa", "Marca / Modelo"].includes(label),
  );
}

function buildVehicleDataSection(payload: LaudoPayload, view: LaudoReportViewModel): PdfNode[] {
  const inspection = payload.inspection;
  const origin = resolveVehicleOrigin(inspection);
  const uf = inspectionText(inspection, "vehicle_uf");
  const chips = [
    { label: "Placa", value: formatPlate(inspection.plate), icon: "identification" as const },
    ...(hasLaudoValue(inspection.renavam)
      ? [{ label: "Renavam", value: String(inspection.renavam), icon: "document" as const }]
      : []),
    ...(hasLaudoValue(inspection.chassis)
      ? [{ label: "Chassi", value: String(inspection.chassis), icon: "structure" as const }]
      : []),
    ...(uf ? [{ label: "UF", value: uf, icon: "document" as const }] : []),
  ];

  const chipsNode: PdfNode = {
    columns: [
      {
        width: 72,
        stack: [
          ...(payload.brandLogoDataUrl
            ? [{ image: payload.brandLogoDataUrl, fit: [56, 28], margin: [0, 0, 0, 4] }]
            : []),
          {
            text: inspection.brand.toUpperCase(),
            bold: true,
            fontSize: PDF_FONT.h2,
            color: PDF_COLOR.navy,
            alignment: "center",
          },
          {
            text: inspection.model,
            fontSize: PDF_FONT.micro,
            color: PDF_COLOR.muted,
            alignment: "center",
            margin: [0, 1, 0, 0],
          },
        ],
      },
      ...(origin
        ? [
            {
              width: 56,
              stack: [
                {
                  columns: [
                    { width: "*", text: "" },
                    { width: 22, ...brazilFlagIcon(14) },
                    { width: "*", text: "" },
                  ],
                  margin: [0, 4, 0, 4],
                },
                {
                  text: origin.label.toUpperCase(),
                  bold: true,
                  fontSize: PDF_FONT.micro,
                  color: PDF_COLOR.navy,
                  alignment: "center",
                  characterSpacing: PDF_TRACKING.wide,
                },
              ],
            },
          ]
        : []),
      {
        width: "*",
        stack: [
          {
            columns: chips.slice(0, 2).map((chip) => ({
              width: "*",
              ...premiumMetaChip({ ...chip, accent: view.primaryColor }),
            })),
            columnGap: 6,
          },
          ...(chips.length > 2
            ? [
                {
                  columns: chips.slice(2, 4).map((chip) => ({
                    width: "*",
                    ...premiumMetaChip({ ...chip, accent: view.primaryColor }),
                  })),
                  columnGap: 6,
                  margin: [0, 6, 0, 0],
                },
              ]
            : []),
        ],
      },
    ],
    columnGap: PDF_SPACE.lg,
    margin: [0, 0, 0, PDF_SPACE.md],
  };

  const yearRow: [string, string] = [
    "Ano fab./mod.",
    `${inspection.manufacture_year} / ${inspection.model_year}`,
  ];
  const detailRows: [string, string][] = [
    ["Marca", inspection.brand],
    ["Modelo", inspection.model],
    yearRow,
    ...buildVehicleDetailRows(inspection).filter(
      ([label]) => label !== "Ano fab./mod.",
    ),
  ];
  const grid = premiumKvGrid(detailRows, { columns: 2 });

  return [
    premiumSection({
      icon: "vehicle",
      title: "Dados do veículo",
      subtitle: "Informações de identificação e características do veículo avaliado.",
      barLabel: "Detalhes",
      barIcon: "vehicle",
      accent: view.primaryColor,
      status: { tone: "success" },
      children: [chipsNode, grid ?? { text: "" }],
    }),
  ];
}

function buildApontamentosSection(view: LaudoReportViewModel): PdfNode[] {
  if (view.apontamentos.length === 0) return [];

  return [
    premiumSection({
      icon: "damage",
      title: "Apontamentos identificados",
      subtitle: "Itens do checklist com não conformidade registrada na inspeção.",
      barLabel: "Apontamentos",
      accent: toneColor(view.opinionTone),
      status: { tone: view.opinionTone },
      children: view.apontamentos.map((apontamento, index) =>
        findingRow(index, {
          kicker: apontamento.categoryLabel,
          title: apontamento.itemName,
          body: apontamento.note || undefined,
          accent: toneColor(view.opinionTone),
        }),
      ),
    }),
  ];
}

function buildDamagesSection(view: LaudoReportViewModel): PdfNode[] {
  if (view.damages.length === 0) return [];

  return [
    premiumSection({
      icon: "damage",
      title: "Avarias identificadas",
      subtitle: "Apontamentos encontrados durante a vistoria.",
      barLabel: "Avarias",
      accent: view.primaryColor,
      status: { tone: "warning" },
      children: view.damages.map((damage, index) => {
        const description =
          damage.displayName && damage.displayName !== damage.location ? damage.displayName : null;

        return findingRow(index, {
          kicker: description || damage.severity ? damage.location : undefined,
          title: description || damage.severity || damage.location,
          body: description && damage.severity ? damage.severity : undefined,
          accent: PDF_COLOR.warning,
        });
      }),
    }),
  ];
}

function buildSaleMarketSection(
  inspection: LaudoPayload["inspection"],
  view: LaudoReportViewModel,
): PdfNode[] {
  if (!hasSaleMarketSectionData(inspection)) return [];
  const rows = buildSaleMarketInfoRows(inspection);
  const grid = premiumKvGrid(rows, { columns: 2 });
  if (!grid) return [];

  return [
    premiumSection({
      icon: "market",
      title: "Venda, justiça e mercado",
      subtitle: "Informações comerciais, judiciais e de referência de mercado.",
      barLabel: "Mercado",
      accent: view.primaryColor,
      children: [grid],
    }),
  ];
}

type ChecklistCategoryVm = LaudoReportViewModel["categories"][number];

function checklistStatusCell(status: string): PdfNode {
  return statusBadge(checklistStatusDisplay(status), getChecklistStatusPdfColor(status));
}

function checklistItemCell(item: ChecklistCategoryVm["items"][number]): PdfNode {
  const isIssue = item.status === ChecklistStatus.NAO_CONFORME;
  return {
    columns: [
      {
        width: 10,
        canvas: [
          {
            type: "ellipse",
            x: 4,
            y: 5,
            r1: isIssue ? 3 : 2.2,
            r2: isIssue ? 3 : 2.2,
            color: isIssue
              ? PDF_COLOR.warning
              : item.status === ChecklistStatus.CONFORME
                ? PDF_COLOR.success
                : PDF_COLOR.subtle,
          },
        ],
      },
      {
        width: "*",
        text: item.item_name,
        fontSize: PDF_FONT.small,
        bold: isIssue,
        color: PDF_COLOR.text,
      },
    ],
    columnGap: PDF_SPACE.xs,
  };
}

function checklistObservationCell(item: ChecklistCategoryVm["items"][number]): PdfNode {
  const observation = formatChecklistObservationForPdf(item.status, item.notes);
  return {
    text: observation || "-",
    fontSize: PDF_FONT.micro,
    color: observation ? PDF_COLOR.warning : PDF_COLOR.subtle,
  };
}

function checklistCategoryTable(category: ChecklistCategoryVm, accent: string): PdfNode {
  return {
    margin: [0, 0, 0, PDF_SPACE.sm],
    stack: [
      subsectionHeading(category.label, {
        accent,
        description: `${category.total} itens · ${category.naoConforme} apontamento(s)`,
        margin: [0, PDF_SPACE.sm, 0, 2],
        width: INNER_WIDTH,
      }),
      {
        table: {
          headerRows: 1,
          dontBreakRows: true,
          widths: ["*", 88, 100],
          body: [
            [tableHeaderCell("Item"), tableHeaderCell("Status"), tableHeaderCell("Observação")],
            ...category.items.map((item) => [
              checklistItemCell(item),
              checklistStatusCell(item.status),
              checklistObservationCell(item),
            ]),
          ],
        },
        layout: dataTableLayout(),
      },
    ],
  };
}

function buildChecklistSection(view: LaudoReportViewModel): PdfNode[] {
  if (view.categories.length === 0) {
    return [
      premiumSection({
        icon: "checklist",
        title: "Checklist técnico",
        subtitle: "Avaliação dos componentes verificados durante a inspeção.",
        barLabel: "Checklist",
        accent: view.primaryColor,
        children: [
          { text: "Nenhum item de checklist registrado nesta vistoria.", color: PDF_COLOR.muted },
        ],
      }),
    ];
  }

  return [
    premiumSectionLead({
      icon: "checklist",
      title: "Checklist técnico",
      subtitle: "Avaliação dos componentes e características verificadas durante a inspeção.",
      accent: view.primaryColor,
      status: {
        tone: view.stats.naoConforme > 0 ? "warning" : "success",
      },
    }),
    premiumSectionBody(
      view.categories.map((category) => checklistCategoryTable(category, view.primaryColor)),
      {
        accent: view.primaryColor,
        barLabel: "Itens avaliados",
        barIcon: "checklist",
      },
    ),
  ];
}

function buildPhotoSection(payload: LaudoPayload, view: LaudoReportViewModel): PdfNode[] {
  const photos = payload.photos;

  if (photos.length === 0) {
    return [
      premiumSection({
        icon: "camera",
        title: "Registro fotográfico",
        subtitle: "Evidências visuais coletadas durante a vistoria.",
        barLabel: "Fotos",
        accent: view.primaryColor,
        children: [{ text: "Nenhuma foto registrada para esta vistoria.", color: PDF_COLOR.muted }],
      }),
    ];
  }

  const grouped = groupPhotosBySection(photos);
  const bodyChildren: PdfNode[] = [];
  let firstGroup = true;

  for (const section of PHOTO_CATALOG) {
    const sectionPhotos = grouped.get(section.key);
    if (!sectionPhotos?.length) continue;

    const heading = subsectionHeading(section.name, {
      accent: view.primaryColor,
      width: INNER_WIDTH,
      margin: [0, firstGroup ? 0 : PDF_SPACE.lg, 0, PDF_SPACE.sm],
    });
    const grid = buildPhotoGrid(sectionPhotos, {
      accent: view.primaryColor,
      contentWidth: INNER_WIDTH,
    });

    bodyChildren.push({
      unbreakable: true,
      stack: [heading, ...(grid[0] ? [grid[0]] : [])],
    });
    bodyChildren.push(...grid.slice(1));
    firstGroup = false;
  }

  return [
    premiumSectionLead({
      icon: "camera",
      title: "Registro fotográfico",
      subtitle: "Evidências visuais coletadas durante a vistoria.",
      accent: view.primaryColor,
      status: { tone: "info" },
    }),
    premiumSectionBody(bodyChildren, {
      accent: view.primaryColor,
      barLabel: "Fotos",
      barIcon: "camera",
    }),
  ];
}

function buildPaintSection(view: LaudoReportViewModel, payload: LaudoPayload): PdfNode[] {
  if (!view.hasPaintAnalysisData) return [];

  const children: PdfNode[] = [
    buildPaintSilhouetteNode(view.paintZones, payload.vehicleTopViewDataUrl),
  ];

  if (view.paintChecklistItems.length > 0) {
    children.push(
      subsectionHeading("Itens de pintura", {
        accent: view.primaryColor,
        margin: [0, PDF_SPACE.md, 0, 2],
        width: INNER_WIDTH,
      }),
      {
        table: {
          headerRows: 1,
          widths: ["72%", "28%"],
          body: [
            [tableHeaderCell("Item"), tableHeaderCell("Status")],
            ...view.paintChecklistItems.map((item) => {
              const observation = formatChecklistObservationForPdf(item.status, item.notes);
              return [
                {
                  stack: [
                    { text: item.item_name, fontSize: PDF_FONT.body, color: PDF_COLOR.text },
                    ...(observation
                      ? [
                          {
                            text: observation,
                            fontSize: PDF_FONT.micro,
                            color: PDF_COLOR.warning,
                            margin: [0, 1, 0, 0],
                          },
                        ]
                      : []),
                  ],
                },
                statusBadge(
                  checklistStatusDisplay(item.status),
                  getChecklistStatusPdfColor(item.status),
                ),
              ];
            }),
          ],
        },
        layout: dataTableLayout(),
      },
    );
  }

  return [
    premiumSection({
      icon: "paint",
      title: "Análise de pintura e estrutura",
      subtitle: "Avaliação visual das condições da carroceria e estrutura.",
      barLabel: "Pintura",
      accent: view.primaryColor,
      children,
    }),
  ];
}

function buildOpinionSection(
  inspection: LaudoPayload["inspection"],
  view: LaudoReportViewModel,
): PdfNode[] {
  const notes = inspection.technical_notes?.trim();
  if (!hasLaudoValue(notes)) return [];

  return [
    premiumSection({
      icon: "opinion",
      title: "Parecer técnico",
      subtitle: "Considerações do vistoriador sobre as condições observadas.",
      barLabel: "Parecer",
      accent: view.primaryColor,
      children: [
        {
          text: notes,
          fontSize: PDF_FONT.bodyLarge,
          color: PDF_COLOR.text,
          lineHeight: PDF_LINE_HEIGHT.relaxed,
          alignment: "justify",
        },
      ],
    }),
  ];
}

function buildConclusionSection(view: LaudoReportViewModel): PdfNode[] {
  const photoNotes = view.conclusionHighlights.filter((line) => line.includes("Nenhuma fotografia"));
  const chartSlices = view.checklistDistribution.filter((slice) => slice.value > 0);
  const totalChecked = chartSlices.reduce((sum, slice) => sum + slice.value, 0);
  const barWidth = Math.min(INNER_WIDTH, 420);

  return [
    premiumSection({
      icon: "conclusion",
      title: "Conclusão da vistoria",
      subtitle: "Resultado final da avaliação técnica.",
      barLabel: "Resultado",
      accent: view.primaryColor,
      status: { tone: view.opinionTone },
      unbreakable: true,
      children: [
        resultBadge(view.opinionLabel, {
          accent: toneColor(view.opinionTone),
          tone: view.opinionTone,
          width: INNER_WIDTH,
          compact: true,
        }),
        metricRow(
          [
            {
              label: "Itens aprovados",
              value: String(view.stats.conforme),
              accent: PDF_COLOR.success,
            },
            {
              label: "Apontamentos",
              value: String(view.stats.naoConforme),
              accent: PDF_COLOR.warning,
            },
            {
              label: "Fotografias",
              value: String(view.photoCount),
              accent: PDF_COLOR.info,
            },
          ],
          { margin: [0, PDF_SPACE.lg, 0, 0] },
        ),
        ...(chartSlices.length > 0
          ? [
              {
                text: "DISTRIBUIÇÃO DO CHECKLIST",
                fontSize: PDF_FONT.micro,
                bold: true,
                color: PDF_COLOR.muted,
                characterSpacing: PDF_TRACKING.wide,
                margin: [0, PDF_SPACE.lg, 0, PDF_SPACE.sm],
              },
              {
                columns: [
                  {
                    width: 78,
                    stack: [
                      buildDonutChartNode(chartSlices, {
                        size: 64,
                        thickness: 11,
                        // Sem overlay no anel — total fica sob o gráfico, alinhado.
                        centerValue: String(totalChecked),
                        centerLabel: "itens",
                        centerValueFontSize: 12,
                        centerLabelFontSize: 6,
                      }),
                    ],
                  },
                  {
                    width: "*",
                    margin: [PDF_SPACE.lg, 2, 0, 0],
                    stack: [
                      buildStackedBarNode(chartSlices, { width: barWidth - 90, height: 8 }),
                      {
                        ...buildChartLegendNode(chartSlices, {
                          showPercentage: true,
                          unit: "itens",
                        }),
                        margin: [0, PDF_SPACE.md, 0, 0],
                      },
                    ],
                  },
                ],
                columnGap: PDF_SPACE.sm,
              },
            ]
          : []),
        ...(photoNotes.length > 0
          ? [
              bulletList(photoNotes, {
                color: PDF_COLOR.navy,
                margin: [0, PDF_SPACE.md, 0, 0],
              }),
            ]
          : []),
      ],
    }),
  ];
}

function buildAuthenticitySection(payload: LaudoPayload, view: LaudoReportViewModel): PdfNode[] {
  const qrValue = payload.validationUrl || payload.verificationCode;
  const inspector = payload.inspector;

  return [
    premiumSection({
      icon: "authenticity",
      title: "Autenticidade do laudo",
      subtitle: "Documento verificável na plataforma Torres.",
      barLabel: "Validação",
      accent: view.primaryColor,
      unbreakable: true,
      children: [
        {
          columns: [
            {
              width: PDF_AUTHENTICITY.qrSize + 12,
              stack: [
                { qr: qrValue, fit: PDF_AUTHENTICITY.qrSize },
                {
                  text: "Validação pública",
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
                  valueSize: PDF_FONT.kpi,
                  valueColor: PDF_COLOR.navy,
                  margin: [0, 0, 0, PDF_SPACE.md],
                }),
                {
                  text: "HASH SHA-256",
                  fontSize: PDF_FONT.micro,
                  bold: true,
                  color: PDF_COLOR.muted,
                  characterSpacing: PDF_TRACKING.wide,
                  margin: [0, 0, 0, PDF_SPACE.xs],
                },
                codeBlock(payload.integrityHash, { fontSize: PDF_FONT.micro }),
                {
                  text: "Documento verificável na plataforma Torres.",
                  fontSize: PDF_FONT.small,
                  color: PDF_COLOR.muted,
                  margin: [0, PDF_SPACE.md, 0, 0],
                },
                ...(payload.validationUrl
                  ? [
                      {
                        text: payload.validationUrl,
                        fontSize: PDF_FONT.small,
                        color: PDF_COLOR.navy,
                        margin: [0, 2, 0, 0],
                      },
                    ]
                  : []),
                ...(inspector?.full_name
                  ? [
                      labelValueBlock("Vistoriador responsável", inspector.full_name, {
                        margin: [0, PDF_SPACE.md, 0, 0],
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
          columnGap: PDF_SPACE.lg,
        },
      ],
    }),
  ];
}

function buildLegalSection(view: LaudoReportViewModel): PdfNode[] {
  const paragraphs = getLaudoLegalParagraphs();

  return [
    premiumSection({
      icon: "legal",
      title: "Informações jurídicas",
      subtitle: "Natureza, validade e responsabilidades relacionadas a este laudo.",
      barLabel: "Jurídico",
      accent: view.primaryColor,
      children: paragraphs.map((paragraph, index) => ({
        stack: [
          {
            text: (LEGAL_HEADINGS[index] ?? `Informativo ${index + 1}`).toUpperCase(),
            fontSize: PDF_FONT.micro,
            bold: true,
            color: PDF_COLOR.navy,
            characterSpacing: PDF_TRACKING.wide,
            margin: [0, index === 0 ? 0 : PDF_SPACE.sm, 0, 1],
          },
          {
            text: paragraph,
            fontSize: PDF_FONT.small,
            alignment: "justify" as const,
            color: PDF_COLOR.text,
            lineHeight: PDF_LINE_HEIGHT.tight,
          },
        ],
      })),
    }),
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
            ? [
                {
                  text: formatDocument(company.document),
                  fontSize: PDF_FONT.small,
                  color: PDF_COLOR.muted,
                },
              ]
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
    margin: [0, PDF_SPACE.md, 0, 0],
  };
}

export function buildLaudoDocDefinition(payload: LaudoPayload): Record<string, unknown> {
  const view = buildLaudoReportViewModel(payload);
  const company = payload.company;
  const footerBrand = company?.name?.trim() || "Torres Vistoria";

  setActiveSectionIcons(payload.sectionIconDataUrls);

  try {
    const content: PdfNode[] = [
      ...buildCover(payload, view),
      ...buildInspectionDataSection(payload, view),
      ...buildVehicleDataSection(payload, view),
      ...buildSaleMarketSection(payload.inspection, view),
      // Slots futuros de Torres Consulta — só aparecem com dados reais.
      ...buildConsultaSections(payload.consultaSlots ?? [], { accent: view.primaryColor }),
      ...buildApontamentosSection(view),
      ...buildDamagesSection(view),
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
      header: () => ({
        columns: [
          {
            text: footerBrand.toUpperCase(),
            fontSize: PDF_FONT.micro,
            bold: true,
            color: PDF_COLOR.navy,
            characterSpacing: PDF_TRACKING.wide,
            margin: [PDF_PAGE.margins[0], 10, 0, 0],
          },
          {
            canvas: [
              {
                type: "rect",
                x: 0,
                y: 12,
                w: 22,
                h: 2,
                color: view.primaryColor,
              },
            ],
            width: 28,
          },
          {
            text: `Laudo ${payload.laudoNumber}`,
            fontSize: PDF_FONT.micro,
            color: PDF_COLOR.muted,
            alignment: "right",
            margin: [0, 10, PDF_PAGE.margins[2], 0],
          },
        ],
      }),
      footer: (currentPage: number, pageCount: number) => ({
        columns: [
          {
            stack: [
              {
                canvas: [
                  {
                    type: "line",
                    x1: 0,
                    y1: 0,
                    x2: PDF_PAGE.contentWidth,
                    y2: 0,
                    lineWidth: PDF_STROKE.hairline,
                    lineColor: PDF_COLOR.border,
                  },
                ],
              },
              {
                columns: [
                  {
                    text: payload.laudoNumber,
                    fontSize: PDF_FONT.micro,
                    color: PDF_COLOR.muted,
                  },
                  {
                    text: `Página ${currentPage}/${pageCount}`,
                    fontSize: PDF_FONT.micro,
                    color: PDF_COLOR.muted,
                    alignment: "right",
                  },
                ],
                margin: [0, 3, 0, 0],
              },
            ],
            margin: [PDF_PAGE.margins[0], 3, PDF_PAGE.margins[2], 0],
          },
        ],
      }),
      defaultStyle: {
        fontSize: PDF_FONT.body,
        color: PDF_COLOR.text,
      },
    };
  } finally {
    setActiveSectionIcons(undefined);
  }
}
