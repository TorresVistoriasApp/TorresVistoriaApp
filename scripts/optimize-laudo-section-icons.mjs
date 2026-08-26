/**
 * Converte ícones pictóricos das seções do laudo (public/images/laudo/sections/)
 * para WebP com alpha — usados no PDF via pdf-embed-image.
 *
 * Uso: node scripts/optimize-laudo-section-icons.mjs
 */
import { readdir, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DIR = "public/images/laudo/sections";

const pngFiles = (await readdir(DIR)).filter((f) => f.endsWith(".png"));
if (pngFiles.length === 0) {
  console.log("Nenhum PNG em", DIR);
  process.exit(0);
}

for (const file of pngFiles) {
  const base = file.replace(/\.png$/i, "");
  const input = path.join(DIR, file);
  const output = path.join(DIR, `${base}.webp`);
  const webp = await sharp(input)
    .webp({ quality: 86, effort: 6, alphaQuality: 90 })
    .toBuffer();
  await sharp(webp).toFile(output);
  await unlink(input);
  const meta = await sharp(webp).metadata();
  console.log(`OK: ${base}.webp (${meta.width}x${meta.height}, ${webp.length} bytes)`);
}
