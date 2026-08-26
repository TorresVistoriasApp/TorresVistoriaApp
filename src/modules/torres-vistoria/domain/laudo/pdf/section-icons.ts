/**
 * Assets pictóricos das seções do laudo (imagens por segmento).
 * Substitui ícones outline na intro — alinhado à referência editorial.
 */
import { PUBLIC_IMAGES } from "@/shared/lib/public-images";
import type { PdfIconName } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-icons";

/** Mapa ícone lógico → asset estático. */
export const LAUDO_SECTION_ICON_PATHS: Record<PdfIconName, string> = {
  vehicle: PUBLIC_IMAGES.laudo.sections.vehicle,
  inspection: PUBLIC_IMAGES.laudo.sections.inspection,
  camera: PUBLIC_IMAGES.laudo.sections.camera,
  checklist: PUBLIC_IMAGES.laudo.sections.checklist,
  damage: PUBLIC_IMAGES.laudo.sections.damage,
  authenticity: PUBLIC_IMAGES.laudo.sections.authenticity,
  shield: PUBLIC_IMAGES.laudo.sections.authenticity,
  conclusion: PUBLIC_IMAGES.laudo.sections.conclusion,
  paint: PUBLIC_IMAGES.laudo.sections.paint,
  opinion: PUBLIC_IMAGES.laudo.sections.opinion,
  document: PUBLIC_IMAGES.laudo.sections.opinion,
  legal: PUBLIC_IMAGES.laudo.sections.legal,
  market: PUBLIC_IMAGES.laudo.sections.market,
  structure: PUBLIC_IMAGES.laudo.sections.structure,
  identification: PUBLIC_IMAGES.laudo.sections.inspection,
};

export type LaudoSectionIconDataUrls = Partial<Record<PdfIconName, string>>;

export function sectionIconPath(name: PdfIconName): string {
  return LAUDO_SECTION_ICON_PATHS[name];
}

export function resolveSectionIconDataUrl(
  icons: LaudoSectionIconDataUrls | undefined,
  name: PdfIconName,
): string | undefined {
  return icons?.[name];
}

/** Chaves únicas de arquivo a carregar (evita duplicar authenticity/shield). */
export function uniqueSectionIconPaths(): string[] {
  return [...new Set(Object.values(LAUDO_SECTION_ICON_PATHS))];
}
