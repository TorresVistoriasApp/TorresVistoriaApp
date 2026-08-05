import { photoMatchesCategory } from "@/modules/torres-vistoria/domain/photos/legacy-category-map";
import { isPhotoCategoryComplete, isPendingPhotoId } from "@/modules/torres-vistoria/domain/photos/photo-progress";

export const QDP_PORTA_CATEGORY_KEYS = [
  "QDP_PORTA_DIANT_ESQ",
  "QDP_PORTA_TRASEIRA_ESQ",
  "QDP_PORTA_DIANT_DIR",
  "QDP_PORTA_TRASEIRA_DIR",
] as const;

export const QDP_TESTE_PINTURA_CATEGORY_KEYS = [
  "QDP_TESTE_PINTURA_1",
  "QDP_TESTE_PINTURA_2",
  "QDP_TESTE_PINTURA_3",
  "QDP_TESTE_PINTURA_4",
] as const;

export const QUADROS_PORTAS_SUBSECTION_KEYS = {
  PORTAS: "QDP_PORTAS",
  TESTE_PINTURA: "QDP_TESTE_PINTURA",
} as const;

export type PaintTestMethod = "CANETA_TESTE" | "MEDIDOR_ESPESSURA";

export const PAINT_TEST_METHOD_OPTIONS: {
  value: PaintTestMethod;
  label: string;
  description: string;
}[] = [
  {
    value: "CANETA_TESTE",
    label: "Caneta teste",
    description: "Evidência com caneta teste de pintura sobre o quadro.",
  },
  {
    value: "MEDIDOR_ESPESSURA",
    label: "Medidor de espessura",
    description: "Evidência com medidor de espessura no quadro.",
  },
];

export const PAINT_TEST_METHOD_LABELS: Record<PaintTestMethod, string> = {
  CANETA_TESTE: "Caneta teste",
  MEDIDOR_ESPESSURA: "Medidor de espessura",
};

type PhotoLike = { id: string; category: string };

export type SubsectionPhotoProgress = {
  completed: number;
  total: number;
  remaining: number;
  isComplete: boolean;
};

export function isQuadrosPortasTestCategory(categoryKey: string): boolean {
  return QDP_TESTE_PINTURA_CATEGORY_KEYS.some((key) => photoMatchesCategory(categoryKey, key));
}

export function computeSubsectionPhotoProgress(
  photos: PhotoLike[],
  categoryKeys: readonly string[],
): SubsectionPhotoProgress {
  const total = categoryKeys.length;
  const completed = categoryKeys.filter((key) => isPhotoCategoryComplete(photos, key)).length;

  return {
    completed,
    total,
    remaining: Math.max(0, total - completed),
    isComplete: completed >= total,
  };
}

export function computeQuadrosPortasProgress(photos: PhotoLike[]) {
  return {
    portas: computeSubsectionPhotoProgress(photos, QDP_PORTA_CATEGORY_KEYS),
    testePintura: computeSubsectionPhotoProgress(photos, QDP_TESTE_PINTURA_CATEGORY_KEYS),
  };
}

export function buildPaintTestDisplayName(
  categoryKey: string,
  method: PaintTestMethod,
): string {
  const slot = QDP_TESTE_PINTURA_CATEGORY_KEYS.findIndex((key) =>
    photoMatchesCategory(categoryKey, key),
  );
  const index = slot >= 0 ? slot + 1 : 1;
  return `Teste de pintura ${index} · ${PAINT_TEST_METHOD_LABELS[method]}`;
}

export function countConfirmedPhotosForCategories(
  photos: PhotoLike[],
  categoryKeys: readonly string[],
): number {
  return categoryKeys.reduce((sum, key) => {
    const count = photos.filter(
      (photo) =>
        !isPendingPhotoId(photo.id) && photoMatchesCategory(photo.category, key),
    ).length;
    return sum + (count > 0 ? 1 : 0);
  }, 0);
}
