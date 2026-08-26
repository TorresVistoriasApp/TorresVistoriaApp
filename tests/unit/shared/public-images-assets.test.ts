import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PUBLIC_IMAGES } from "@/shared/lib/public-images";

function collectStaticImagePaths(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string" && value.startsWith("/images/")) {
    out.push(value);
    return out;
  }
  if (typeof value === "function" || value === null || value === undefined) {
    return out;
  }
  if (typeof value === "object") {
    for (const entry of Object.values(value)) {
      collectStaticImagePaths(entry, out);
    }
  }
  return out;
}

describe("PUBLIC_IMAGES assets", () => {
  it("referencia apenas arquivos existentes em public/images", () => {
    const paths = [...new Set(collectStaticImagePaths(PUBLIC_IMAGES))].sort();
    const missing: string[] = [];

    for (const publicPath of paths) {
      const diskPath = join(process.cwd(), "public", publicPath.replace(/^\//, ""));
      if (!existsSync(diskPath)) {
        missing.push(publicPath);
      }
    }

    expect(missing, `Assets ausentes: ${missing.join(", ")}`).toEqual([]);
  });

  it("usa WebP nos ícones pictóricos das seções do laudo PDF", () => {
    for (const path of Object.values(PUBLIC_IMAGES.laudo.sections)) {
      expect(path.endsWith(".webp"), path).toBe(true);
    }
    expect(PUBLIC_IMAGES.laudo.vehicleTopView.endsWith(".webp")).toBe(true);
  });
});
