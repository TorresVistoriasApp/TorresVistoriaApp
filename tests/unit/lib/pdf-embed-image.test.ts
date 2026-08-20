import { describe, expect, it } from "vitest";
import {
  ensureImageBlob,
  mapWithConcurrency,
  sniffImageMime,
} from "@/shared/lib/pdf-embed-image";

describe("ensureImageBlob", () => {
  it("mantém blob que já tem MIME de imagem", () => {
    const source = new Blob([new Uint8Array([1, 2, 3])], { type: "image/jpeg" });
    expect(ensureImageBlob(source).type).toBe("image/jpeg");
  });

  it("aplica mimeHint quando o Storage devolve octet-stream", () => {
    const source = new Blob([new Uint8Array([1, 2, 3])], { type: "application/octet-stream" });
    expect(ensureImageBlob(source, "image/webp").type).toBe("image/webp");
  });

  it("assume webp quando não há tipo nem hint", () => {
    const source = new Blob([new Uint8Array([1, 2, 3])]);
    expect(ensureImageBlob(source).type).toBe("image/webp");
  });
});

describe("sniffImageMime", () => {
  it("detecta JPEG pelos magic bytes", () => {
    expect(sniffImageMime(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
  });

  it("detecta WebP (RIFF....WEBP)", () => {
    const bytes = new Uint8Array(12);
    bytes.set([0x52, 0x49, 0x46, 0x46], 0);
    bytes.set([0x57, 0x45, 0x42, 0x50], 8);
    expect(sniffImageMime(bytes)).toBe("image/webp");
  });

  it("não classifica HTML como imagem", () => {
    const html = new TextEncoder().encode("<!DOCTYPE html><html>");
    expect(sniffImageMime(html)).toBeNull();
  });
});

describe("mapWithConcurrency", () => {
  it("preserva ordem e respeita o limite de paralelismo", async () => {
    let inFlight = 0;
    let peak = 0;
    const items = [1, 2, 3, 4, 5, 6];

    const results = await mapWithConcurrency(items, 2, async (item) => {
      inFlight += 1;
      peak = Math.max(peak, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 10));
      inFlight -= 1;
      return item * 10;
    });

    expect(results).toEqual([10, 20, 30, 40, 50, 60]);
    expect(peak).toBeLessThanOrEqual(2);
  });
});
