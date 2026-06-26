import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  PHOTO_CATALOG,
  getPhotoCategoryLabel,
  photoMatchesCategory,
} from "@/lib/photos/photo-catalog";
import type { LaudoPhoto } from "@/lib/laudo/laudo-model";

type PdfNode = Record<string, unknown>;

function formatPhotoCaption(photo: LaudoPhoto, index: number): string {
  const name = photo.display_name ?? photo.label ?? getPhotoCategoryLabel(photo.category);
  const date = photo.captured_at ?? photo.created_at;
  const dateStr = date
    ? format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : "Data não registrada";
  return `${index}. ${name} · ${dateStr}`;
}

export function buildSectionPhotoCaption(photo: LaudoPhoto, sectionIndex: number, photoIndex: number): string {
  const name = photo.display_name ?? getPhotoCategoryLabel(photo.category);
  const date = photo.captured_at ?? photo.created_at;
  const dateStr = date
    ? format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR })
    : "—";
  return `${sectionIndex}.${photoIndex} ${name} · ${dateStr}`;
}

export function groupPhotosBySection(photos: LaudoPhoto[]): Map<string, LaudoPhoto[]> {
  const grouped = new Map<string, LaudoPhoto[]>();

  for (const section of PHOTO_CATALOG) {
    const sectionPhotos: LaudoPhoto[] = [];

    for (const category of section.categories) {
      const matched = photos
        .filter((photo) => photoMatchesCategory(photo.category, category.key))
        .sort(
          (a, b) =>
            new Date(a.captured_at ?? a.created_at ?? 0).getTime() -
            new Date(b.captured_at ?? b.created_at ?? 0).getTime(),
        );
      sectionPhotos.push(...matched);
    }

    if (sectionPhotos.length > 0) {
      grouped.set(section.key, sectionPhotos);
    }
  }

  return grouped;
}

export function buildPhotoLegend(photo: LaudoPhoto, labelOverride?: string): PdfNode {
  const name = labelOverride ?? photo.display_name ?? getPhotoCategoryLabel(photo.category);
  const date = photo.captured_at ?? photo.created_at;
  const dateStr = date
    ? format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
    : "—";
  const timeStr = date ? format(new Date(date), "HH:mm", { locale: ptBR }) : "—";

  return {
    stack: [
      { text: name, bold: true, fontSize: 8, color: "#075985", alignment: "center" },
      {
        text: `${getPhotoCategoryLabel(photo.category)} · ${dateStr} · ${timeStr}`,
        fontSize: 7,
        color: "#64748b",
        alignment: "center",
        margin: [0, 2, 0, 0],
      },
    ],
    margin: [0, 4, 0, 0],
  };
}

export function buildPhotoNode(photo: LaudoPhoto, labelOverride?: string): PdfNode {
  const legend = buildPhotoLegend(photo, labelOverride);

  if (!photo.dataUrl) {
    return {
      stack: [
        { text: labelOverride ?? getPhotoCategoryLabel(photo.category), bold: true, fontSize: 9 },
        { text: "Imagem indisponível para incorporação no PDF.", fontSize: 8, color: "#64748b" },
      ],
      margin: [0, 0, 0, 8],
    };
  }

  return {
    stack: [
      { image: photo.dataUrl, width: 242, height: 136, fit: [242, 136], alignment: "center" },
      legend,
    ],
    margin: [0, 0, 0, 12],
    unbreakable: true,
  };
}

export function buildPhotoPairs(photos: LaudoPhoto[], labels?: (string | undefined)[]): PdfNode[] {
  const pairs: PdfNode[] = [];
  for (let index = 0; index < photos.length; index += 2) {
    pairs.push({
      columns: [
        buildPhotoNode(photos[index], labels?.[index]),
        photos[index + 1] ? buildPhotoNode(photos[index + 1], labels?.[index + 1]) : {},
      ],
      columnGap: 12,
      margin: [0, 0, 0, 4],
      unbreakable: true,
    });
  }
  return pairs;
}

export { formatPhotoCaption };
