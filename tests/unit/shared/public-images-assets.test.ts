import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, extname } from "node:path";
import { describe, expect, it } from "vitest";
import { PUBLIC_IMAGES } from "@/shared/lib/public-images";
import { CAR_BRANDS } from "@/modules/torres-vistoria/domain/vehicle-brands";
import { getBrandLogoPath } from "@/modules/torres-vistoria/domain/vehicle-brand-logos";

const IMAGE_PATH_RE = /\/images\/[a-zA-Z0-9_./-]+\.[a-zA-Z0-9]+/g;
const TEXT_EXTS = new Set([".ts", ".tsx", ".css", ".html", ".json", ".webmanifest"]);

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

function toDiskPath(publicPath: string): string {
  return join(process.cwd(), "public", publicPath.replace(/^\//, ""));
}

function walkFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(full));
    } else if (TEXT_EXTS.has(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function missingOnDisk(paths: string[]): string[] {
  return [...new Set(paths)].filter((publicPath) => !existsSync(toDiskPath(publicPath))).sort();
}

describe("PUBLIC_IMAGES assets", () => {
  it("referencia apenas arquivos existentes em public/images", () => {
    const missing = missingOnDisk(collectStaticImagePaths(PUBLIC_IMAGES));
    expect(missing, `Assets ausentes: ${missing.join(", ")}`).toEqual([]);
  });

  it("usa WebP nos ícones pictóricos das seções do laudo PDF", () => {
    for (const path of Object.values(PUBLIC_IMAGES.laudo.sections)) {
      expect(path.endsWith(".webp"), path).toBe(true);
    }
    expect(PUBLIC_IMAGES.laudo.vehicleTopView.endsWith(".webp")).toBe(true);
  });

  it("tem arquivo em disco para cada caminho /images/ no código-fonte", () => {
    const files = [
      ...walkFiles(join(process.cwd(), "src")),
      join(process.cwd(), "index.html"),
      join(process.cwd(), "vite.config.ts"),
      join(process.cwd(), "public/images/favicon/site.webmanifest"),
    ].filter((file) => existsSync(file));
    const referenced: string[] = [];

    for (const file of files) {
      const text = readFileSync(file, "utf8");
      const matches = text.match(IMAGE_PATH_RE) ?? [];
      referenced.push(...matches);
    }

    const missing = missingOnDisk(referenced);
    expect(missing, `Caminhos quebrados: ${missing.join(", ")}`).toEqual([]);
  });

  it("tem logo em disco para cada marca do catálogo", () => {
    const missing = CAR_BRANDS.filter((brand) => {
      const publicPath = getBrandLogoPath(brand);
      return !publicPath || !existsSync(toDiskPath(publicPath));
    });
    expect(missing, `Marcas sem logo: ${missing.join(", ")}`).toEqual([]);
  });
});
