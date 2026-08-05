/**
 * Layout canônico do Supabase Storage (Etapa 6).
 *
 * Fotos:  {tenant_id}/{inspection_id}/{photo_category}/{arquivo}.webp
 * Thumb:  {tenant_id}/{inspection_id}/{photo_category}/thumbs/{arquivo}.webp
 * Laudos: {tenant_id}/{inspection_id}/{arquivo}.pdf
 */

export function buildInspectionPhotoPath(
  tenantId: string,
  inspectionId: string,
  category: string,
  fileName: string,
): string {
  return `${tenantId}/${inspectionId}/${category}/${fileName}`;
}

/** Path do thumbnail na subpasta thumbs/ dentro da categoria. */
export function buildInspectionPhotoThumbnailPath(storagePath: string): string {
  const parts = storagePath.split("/");
  const fileName = parts.pop();
  if (!fileName) return storagePath;
  return [...parts, "thumbs", fileName].join("/");
}

export function buildReportStoragePath(
  tenantId: string,
  inspectionId: string,
  fileName: string,
): string {
  return `${tenantId}/${inspectionId}/${fileName}`;
}

/** @deprecated use buildInspectionPhotoPath */
export const buildPhotoPath = buildInspectionPhotoPath;

/** @deprecated use buildInspectionPhotoThumbnailPath */
export const buildThumbnailPath = buildInspectionPhotoThumbnailPath;
