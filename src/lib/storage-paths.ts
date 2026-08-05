/**
 * Layout canônico do Supabase Storage (Etapa 6).
 *
 * Fotos:  {company_id}/{inspection_id}/{photo_category}/{arquivo}.webp
 * Thumb:  {company_id}/{inspection_id}/{photo_category}/thumbs/{arquivo}.webp
 * Laudos: {company_id}/{inspection_id}/{arquivo}.pdf
 */

export function buildInspectionPhotoPath(
  companyId: string,
  inspectionId: string,
  category: string,
  fileName: string,
): string {
  return `${companyId}/${inspectionId}/${category}/${fileName}`;
}

/** Path do thumbnail na subpasta thumbs/ dentro da categoria. */
export function buildInspectionPhotoThumbnailPath(storagePath: string): string {
  const parts = storagePath.split("/");
  const fileName = parts.pop();
  if (!fileName) return storagePath;
  return [...parts, "thumbs", fileName].join("/");
}

export function buildReportStoragePath(
  companyId: string,
  inspectionId: string,
  fileName: string,
): string {
  return `${companyId}/${inspectionId}/${fileName}`;
}

/** @deprecated use buildInspectionPhotoPath */
export const buildPhotoPath = buildInspectionPhotoPath;

/** @deprecated use buildInspectionPhotoThumbnailPath */
export const buildThumbnailPath = buildInspectionPhotoThumbnailPath;
