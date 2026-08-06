/**
 * Recorte do hero — fonte em heroconsultations-source.{webp,jpg,png}
 * Gera: heroconsultations.webp (sem cortar pneus)
 */
import { access, readFile, writeFile } from "node:fs/promises";
import { removeBackground } from "@imgly/background-removal-node";
import sharp from "sharp";

const candidates = [
  "public/images/consultations/heroconsultations-source.webp",
  "public/images/consultations/heroconsultations-source.jpg",
  "public/images/consultations/heroconsultations-source.png",
];

let sourcePath = "";
for (const path of candidates) {
  try {
    await access(path);
    sourcePath = path;
    break;
  } catch {
    /* próximo */
  }
}

if (!sourcePath) {
  throw new Error("Coloque a foto original em public/images/consultations/heroconsultations-source.webp");
}

const outputPath = "public/images/consultations/heroconsultations.webp";
const input = await readFile(sourcePath);
const mime = sourcePath.endsWith(".png")
  ? "image/png"
  : sourcePath.endsWith(".webp")
    ? "image/webp"
    : "image/jpeg";

const cutout = await removeBackground(new Blob([input], { type: mime }), {
  model: "medium",
  output: { format: "image/png", quality: 1 },
});

const { data, info } = await sharp(Buffer.from(await cutout.arrayBuffer()))
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const pixels = new Uint8Array(data);
const w = info.width;
const h = info.height;

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const lum = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    let a = pixels[i + 3];
    if (a === 0) continue;
    if (lum > 245 && a < 252) a = 0;
    else if (a < 30) a = 0;
    else if (a > 200) a = 255;
    pixels[i + 3] = a;
  }
}

// Sem trim — apenas padding para não cortar rodas
const webp = await sharp(pixels, { raw: { width: w, height: h, channels: 4 } })
  .extend({
    top: 16,
    bottom: 40,
    left: 16,
    right: 16,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .webp({ quality: 92, alphaQuality: 100, effort: 6 })
  .toBuffer();

await writeFile(outputPath, webp);
const meta = await sharp(webp).metadata();
console.log(`OK: ${outputPath} (${meta.width}x${meta.height}, ${webp.length} bytes)`);
