import { decode as decodeWebp } from "https://esm.sh/@jsquash/webp@1.4.0";
import { encode as encodeJpeg } from "https://esm.sh/jpeg-js@0.4.4";

const MAX_EDGE = 640;

function sniff(bytes: Uint8Array): "jpeg" | "png" | "webp" | "unknown" {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "png";
  }
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    return "webp";
  }
  return "unknown";
}

function fit(width: number, height: number): { width: number; height: number } {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function downsample(
  data: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
): { data: Uint8Array; width: number; height: number } {
  const next = fit(width, height);
  if (next.width === width && next.height === height) {
    return { data: data instanceof Uint8Array ? data : new Uint8Array(data), width, height };
  }
  const out = new Uint8Array(next.width * next.height * 4);
  for (let y = 0; y < next.height; y++) {
    const srcY = Math.min(height - 1, Math.floor((y * height) / next.height));
    for (let x = 0; x < next.width; x++) {
      const srcX = Math.min(width - 1, Math.floor((x * width) / next.width));
      const src = (srcY * width + srcX) * 4;
      const dst = (y * next.width + x) * 4;
      out[dst] = data[src];
      out[dst + 1] = data[src + 1];
      out[dst + 2] = data[src + 2];
      out[dst + 3] = 255;
    }
  }
  return { data: out, width: next.width, height: next.height };
}

/** Converte a foto persistida (WebP) em JPEG para o pdf-lib embutir. */
export async function imageBytesToJpeg(bytes: Uint8Array): Promise<Uint8Array | null> {
  const kind = sniff(bytes);
  if (kind === "jpeg") return bytes;
  if (kind !== "webp") return null;
  try {
    const decoded = await decodeWebp(bytes);
    const sized = downsample(decoded.data, decoded.width, decoded.height);
    const jpeg = encodeJpeg({ data: sized.data, width: sized.width, height: sized.height }, 70);
    return jpeg.data;
  } catch {
    return null;
  }
}
