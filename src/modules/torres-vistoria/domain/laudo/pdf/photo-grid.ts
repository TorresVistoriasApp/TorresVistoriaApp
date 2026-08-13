/**
 * Grade fotográfica adaptativa do laudo PDF.
 *
 * O número de colunas é decidido pela quantidade real de fotos do bloco, de
 * modo que nenhuma página termine com uma foto solitária minúscula nem com
 * uma faixa vazia. Cada célula (imagem + legenda) é indivisível, então a
 * legenda nunca cai em uma página diferente da fotografia.
 */
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getPhotoCategoryLabel } from "@/modules/torres-vistoria/domain/photos/photo-catalog";
import type { LaudoPhoto } from "@/modules/torres-vistoria/domain/laudo/laudo-model";
import {
  PDF_COLOR,
  PDF_FONT,
  PDF_LINE_HEIGHT,
  PDF_SPACE,
  PDF_TRACKING,
  type PdfMargin,
  type PdfNode,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-tokens";
import { framedImage } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-primitives";

export const PHOTO_GRID_GAP = 4;

/** Contact sheet: células largas, altura controlada para caber 3×2 / 3×3. */
const CELL_ASPECT_RATIO = 0.7;
const SINGLE_PHOTO_ASPECT = 0.68;

/** Larguras de célula por número de colunas, dentro da largura de conteúdo. */
export function photoCellWidth(columns: number, contentWidth: number): number {
  if (columns <= 1) return Math.round(contentWidth * 0.62);
  return Math.floor((contentWidth - PHOTO_GRID_GAP * (columns - 1)) / columns);
}

/** Altura da moldura: proporcional, mas limitada para caber com a legenda. */
export function photoCellHeight(columns: number, contentWidth: number): number {
  const width = photoCellWidth(columns, contentWidth);
  const ratio = columns <= 1 ? SINGLE_PHOTO_ASPECT : CELL_ASPECT_RATIO;
  return Math.round(width * ratio);
}

/**
 * Distribui `count` fotos em linhas. Preferimos 3 colunas; o resto é ajustado
 * para 2+2 quando sobraria uma foto sozinha ao final. `maxColumns` limita o
 * destaque (capa) sem perder fotografias.
 */
export function planPhotoRows(count: number, maxColumns = 3): number[] {
  if (count <= 0) return [];
  const cap = Math.min(Math.max(maxColumns, 1), 3);

  if (count <= cap) return [count];

  if (cap === 1) {
    return Array.from({ length: count }, () => 1);
  }

  if (cap === 2) {
    const rows: number[] = [];
    let remaining = count;
    while (remaining > 0) {
      if (remaining === 3) {
        rows.push(2, 1);
        break;
      }
      const take = Math.min(2, remaining);
      rows.push(take);
      remaining -= take;
    }
    return rows;
  }

  if (count === 4) return [2, 2];
  if (count === 5) return [3, 2];

  const rows: number[] = [];
  let remaining = count;

  while (remaining > 0) {
    if (remaining === 4) {
      rows.push(2, 2);
      remaining = 0;
      continue;
    }
    if (remaining <= 3) {
      rows.push(remaining);
      remaining = 0;
      continue;
    }
    rows.push(3);
    remaining -= 3;
  }

  return rows;
}

export type PhotoCaption = {
  title: string;
  subtitle?: string;
};

function formatCapturedAt(photo: LaudoPhoto): string | undefined {
  const date = photo.captured_at ?? photo.created_at;
  if (!date) return undefined;
  return format(new Date(date), "dd/MM/yyyy · HH:mm", { locale: ptBR });
}

/** Legenda: nome em destaque + data/hora discreta. Sem repetir categoria. */
export function buildPhotoCaption(photo: LaudoPhoto, titleOverride?: string): PhotoCaption {
  const categoryLabel = getPhotoCategoryLabel(photo.category);
  const title =
    titleOverride ??
    photo.complementary_name ??
    (photo.damage_location ? `Avaria — ${photo.damage_location}` : null) ??
    photo.display_name ??
    categoryLabel;

  return {
    title,
    subtitle: formatCapturedAt(photo),
  };
}

function captionNode(caption: PhotoCaption, accent: string, width: number): PdfNode {
  return {
    width,
    margin: [0, 2, 0, 0],
    columns: [
      { width: 2, canvas: [{ type: "rect", x: 0, y: 0.5, w: 2, h: 8.5, color: accent }] },
      {
        width: "*",
        stack: [
          {
            text: caption.title.toUpperCase(),
            fontSize: PDF_FONT.small,
            bold: true,
            color: PDF_COLOR.navy,
            characterSpacing: PDF_TRACKING.tight,
            lineHeight: PDF_LINE_HEIGHT.tight,
          },
          ...(caption.subtitle
            ? [
                {
                  text: caption.subtitle,
                  fontSize: PDF_FONT.micro,
                  color: PDF_COLOR.muted,
                  lineHeight: PDF_LINE_HEIGHT.tight,
                  margin: [0, 1, 0, 0] as PdfMargin,
                },
              ]
            : []),
        ],
      },
    ],
    columnGap: PDF_SPACE.sm,
  };
}

function missingImageNode(caption: PhotoCaption, width: number, height: number): PdfNode {
  return {
    width,
    table: {
      widths: [width],
      heights: [height],
      body: [
        [
          {
            fillColor: PDF_COLOR.surfaceAlt,
            alignment: "center",
            verticalAlignment: "middle",
            margin: [PDF_SPACE.md, 0, PDF_SPACE.md, 0],
            stack: [
              {
                text: caption.title.toUpperCase(),
                fontSize: PDF_FONT.micro,
                bold: true,
                color: PDF_COLOR.muted,
                alignment: "center",
              },
              {
                text: "Imagem indisponível para incorporação",
                fontSize: 5.8,
                color: PDF_COLOR.subtle,
                alignment: "center",
                margin: [0, 2, 0, 0],
              },
            ],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0.4,
      vLineWidth: () => 0.4,
      hLineColor: () => PDF_COLOR.border,
      vLineColor: () => PDF_COLOR.border,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
  };
}

function photoCell(
  photo: LaudoPhoto,
  options: { width: number; height: number; accent: string; titleOverride?: string },
): PdfNode {
  const caption = buildPhotoCaption(photo, options.titleOverride);

  return {
    width: options.width,
    unbreakable: true,
    stack: [
      photo.dataUrl
        ? framedImage(photo.dataUrl, { width: options.width, height: options.height })
        : missingImageNode(caption, options.width, options.height),
      captionNode(caption, options.accent, options.width),
    ],
  };
}

export type PhotoGridOptions = {
  accent: string;
  contentWidth: number;
  /** Rótulos alternativos por índice, alinhados ao array de fotos. */
  titles?: (string | undefined)[];
  /** Limite de colunas — usado para dar mais destaque a blocos pequenos. */
  maxColumns?: number;
};

/**
 * Monta as linhas da grade. Cada linha é `unbreakable`, portanto o pdfmake
 * empurra a linha inteira para a página seguinte quando ela não cabe.
 */
export function buildPhotoGrid(photos: LaudoPhoto[], options: PhotoGridOptions): PdfNode[] {
  if (photos.length === 0) return [];

  const maxColumns = options.maxColumns ?? 3;
  const rows = planPhotoRows(photos.length, maxColumns);
  const nodes: PdfNode[] = [];
  let cursor = 0;

  for (const columns of rows) {
    const rowPhotos = photos.slice(cursor, cursor + columns);
    const width = photoCellWidth(columns, options.contentWidth);
    const height = photoCellHeight(columns, options.contentWidth);

    const cells = rowPhotos.map((photo, index) =>
      photoCell(photo, {
        width,
        height,
        accent: options.accent,
        titleOverride: options.titles?.[cursor + index],
      }),
    );

    const sideGutter =
      columns === 1 ? Math.floor((options.contentWidth - width) / 2) : 0;

    nodes.push({
      columns:
        columns === 1
          ? [{ text: "", width: sideGutter }, ...cells, { text: "", width: "*" }]
          : [...cells, ...(cells.length < columns ? [{ text: "", width: "*" }] : [])],
      columnGap: PHOTO_GRID_GAP,
      margin: [0, 0, 0, PDF_SPACE.xs],
      unbreakable: true,
    });

    cursor += columns;
  }

  return nodes;
}

/** Grade de destaque na capa: fotos maiores, no máximo duas por linha. */
export function buildFeaturedPhotoGrid(photos: LaudoPhoto[], options: PhotoGridOptions): PdfNode[] {
  return buildPhotoGrid(photos, { ...options, maxColumns: 2 });
}
