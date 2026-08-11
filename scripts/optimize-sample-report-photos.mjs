/**
 * Baixa fotos reais do VW T-Cross (Wikimedia Commons) e gera WEBP otimizado
 * para o relatório de exemplo em public/images/consultations/sample-report/.
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = "public/images/consultations/sample-report";

/** CC BY 2.0 — Autobilder Gratis / joonko.de */
const PHOTOS = [
  {
    file: "front.webp",
    url: "https://upload.wikimedia.org/wikipedia/commons/f/f0/2019_Volkswagen_T-Cross_R-Line_1.0_Front.jpg",
    width: 1280,
  },
  {
    file: "rear.webp",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/bf/2019_Volkswagen_T-Cross_R-Line_1.0_Rear.jpg",
    width: 1280,
  },
  {
    file: "side.webp",
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c2/VW_T-Cross_Foto_2020_Free_image_%2849675226028%29.jpg",
    width: 1280,
  },
  {
    file: "interior.webp",
    url: "https://upload.wikimedia.org/wikipedia/commons/2/2e/2019_Volkswagen_T-Cross_R-Line_1.0_Interior.jpg",
    width: 1280,
  },
];

await mkdir(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

for (const photo of PHOTOS) {
  const outputPath = path.join(OUT_DIR, photo.file);
  try {
    await access(outputPath);
    console.log(`SKIP: ${outputPath} (já existe)`);
    continue;
  } catch {
    /* gerar */
  }

  const response = await fetch(photo.url, {
    headers: {
      "User-Agent": "TorresApp/1.0 (sample-report asset script; contact: dev@torres.local)",
    },
  });
  if (!response.ok) {
    throw new Error(`Falha ao baixar ${photo.url}: ${response.status}`);
  }

  const input = Buffer.from(await response.arrayBuffer());
  const webp = await sharp(input)
    .rotate()
    .resize({ width: photo.width, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toBuffer();

  await writeFile(outputPath, webp);
  const meta = await sharp(webp).metadata();
  console.log(`OK: ${outputPath} (${meta.width}x${meta.height}, ${webp.length} bytes)`);
  await sleep(1500);
}
