import imageCompression from "browser-image-compression";

const STORAGE_BUCKET = "inspection-photos";

export async function compressToWebP(file: File): Promise<File> {
  return imageCompression(file, {
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.82,
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
