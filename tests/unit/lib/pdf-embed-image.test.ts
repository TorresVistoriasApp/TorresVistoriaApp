import { describe, expect, it } from "vitest";
import { ensureImageBlob, mapWithConcurrency } from "@/shared/lib/pdf-embed-image";

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
