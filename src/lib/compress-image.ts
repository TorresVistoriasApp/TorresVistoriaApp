import imageCompression from "browser-image-compression";

const STORAGE_BUCKET = "inspection-photos";

export type ImageMetadata = {
  width: number;
  height: number;
  resolution: string;
  contentHash: string;
};

export async function compressToWebP(file: File): Promise<File> {
  return imageCompression(file, {
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.82,
  });
}

export async function extractImageMetadata(file: File | Blob): Promise<ImageMetadata> {
  const bitmap = await createImageBitmap(file);
  const width = bitmap.width;
  const height = bitmap.height;
  bitmap.close();

  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const contentHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return {
    width,
    height,
    resolution: `${width}x${height}`,
    contentHash,
  };
}

export function getDeviceInfo(): { deviceModel: string; deviceOs: string } {
  const ua = navigator.userAgent;
  let deviceOs = "Desconhecido";
  if (/Android/i.test(ua)) deviceOs = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) deviceOs = "iOS";
  else if (/Windows/i.test(ua)) deviceOs = "Windows";
  else if (/Mac/i.test(ua)) deviceOs = "macOS";
  else if (/Linux/i.test(ua)) deviceOs = "Linux";

  return { deviceModel: ua.slice(0, 200), deviceOs };
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
