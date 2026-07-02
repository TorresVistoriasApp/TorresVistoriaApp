import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  PHOTO_CATALOG,
  PHOTO_CATEGORY_MAP,
  getPhotoCategoryLabel,
  photoMatchesCategory,
} from "@/lib/photos/photo-catalog";
import type { LaudoPhoto } from "@/lib/laudo/laudo-model";

type PdfNode = Record<string, unknown>;

function photoTimestamp(photo: LaudoPhoto): number {
  return new Date(photo.captured_at ?? photo.created_at ?? 0).getTime();
}

function comparePhotoCandidates(a: LaudoPhoto, b: LaudoPhoto): number {
  const aHasDataUrl = a.dataUrl ? 1 : 0;
  const bHasDataUrl = b.dataUrl ? 1 : 0;
  if (aHasDataUrl !== bHasDataUrl) return bHasDataUrl - aHasDataUrl;

  const aHasUrl = a.public_url ? 1 : 0;
  const bHasUrl = b.public_url ? 1 : 0;
  if (aHasUrl !== bHasUrl) return bHasUrl - aHasUrl;

  return photoTimestamp(b) - photoTimestamp(a);
}

function pickBestPhoto(candidates: LaudoPhoto[]): LaudoPhoto | undefined {
  if (candidates.length === 0) return undefined;
  return [...candidates].sort(comparePhotoCandidates)[0];
}

function selectPhotosForCategory(
  photos: LaudoPhoto[],
  categoryKey: string,
  usedPhotoIds: Set<string>,
): LaudoPhoto[] {
  const matched = photos
    .filter(
      (photo) =>
        !usedPhotoIds.has(photo.id) && photoMatchesCategory(photo.category, categoryKey),
    )
    .sort((a, b) => photoTimestamp(a) - photoTimestamp(b));

  const categoryDef = PHOTO_CATEGORY_MAP[categoryKey];
  if (!categoryDef || categoryDef.type === "SINGLE") {
    const best = pickBestPhoto(matched);
    return best ? [best] : [];
  }

  const seen = new Set<string>();
  return matched.filter((photo) => {
    if (seen.has(photo.id)) return false;
    seen.add(photo.id);
    return true;
  });
}

const FEATURED_VEHICLE_PHOTO_CATEGORIES = ["EXT_FRENTE_45_ESQ", "EXT_FRENTE_45_DIR"] as const;

/** Fotos de destaque em "Dados do veículo": frente 45° esquerda e direita. */
export function selectFeaturedVehiclePhotos(photos: LaudoPhoto[]): LaudoPhoto[] {
  const featured: LaudoPhoto[] = [];
  const usedPhotoIds = new Set<string>();

  for (const categoryKey of FEATURED_VEHICLE_PHOTO_CATEGORIES) {
    const selected = selectPhotosForCategory(photos, categoryKey, usedPhotoIds);
    if (!selected[0]) continue;
    featured.push(selected[0]);
    usedPhotoIds.add(selected[0].id);
  }

  return featured;
}

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

export function groupPhotosBySection(
  photos: LaudoPhoto[],
  options?: { excludePhotoIds?: Set<string> },
): Map<string, LaudoPhoto[]> {
  const grouped = new Map<string, LaudoPhoto[]>();
  const excludedIds = options?.excludePhotoIds ?? new Set<string>();
  const usedPhotoIds = new Set(excludedIds);
  const availablePhotos = photos.filter((photo) => !excludedIds.has(photo.id));

  for (const section of PHOTO_CATALOG) {
    const sectionPhotos: LaudoPhoto[] = [];

    for (const category of section.categories) {
      const selected = selectPhotosForCategory(availablePhotos, category.key, usedPhotoIds);
      for (const photo of selected) {
        sectionPhotos.push(photo);
        usedPhotoIds.add(photo.id);
      }
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
    const first = buildPhotoNode(photos[index], labels?.[index]);
    const second = photos[index + 1];

    if (second) {
      pairs.push({
        columns: [first, buildPhotoNode(second, labels?.[index + 1])],
        columnGap: 12,
        margin: [0, 0, 0, 4],
        unbreakable: true,
      });
      continue;
    }

    pairs.push({
      ...first,
      margin: [0, 0, 0, 4],
      unbreakable: true,
    });
  }
  return pairs;
}

export { formatPhotoCaption };
