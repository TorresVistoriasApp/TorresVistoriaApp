const STORAGE_BUCKET = "inspection-photos";
const MAX_WIDTH = 1920;
const WEBP_QUALITY = 0.82;

export async function compressToWebP(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não suportado");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha na compressão"))),
      "image/webp",
      WEBP_QUALITY,
    );
  });
}

export function buildPhotoPath(
  companyId: string,
  inspectionId: string,
  category: string,
  fileName: string,
): string {
  return `${companyId}/${inspectionId}/${category}/${fileName}`;
}

export { STORAGE_BUCKET };
