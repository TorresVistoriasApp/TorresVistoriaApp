export const PHOTO_MAX_OUTPUT_BYTES = 2 * 1024 * 1024;
export const PHOTO_OVERSIZE_MESSAGE =
  "A foto continua acima de 2 MB após a compressão. Tire outra foto ou escolha uma imagem menor.";

export function isWithinPhotoUploadLimit(sizeInBytes: number, maxBytes = PHOTO_MAX_OUTPUT_BYTES): boolean {
  return sizeInBytes > 0 && sizeInBytes <= maxBytes;
}
