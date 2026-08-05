/** Normaliza `export function Page()` para um nome derivado do arquivo. */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function pascalCase(fileName) {
  return fileName
    .replace(/\.tsx$/, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

const pageFiles = walk(path.join(ROOT, "src")).filter(
  (file) => /[\\/]pages[\\/]/.test(file) && file.endsWith("-page.tsx"),
);

for (const file of pageFiles) {
  const code = fs.readFileSync(file, "utf8");
  if (!/^export function Page\(/m.test(code)) continue;
  const name = pascalCase(path.basename(file));
  fs.writeFileSync(file, code.replace(/^export function Page\(/m, `export function ${name}(`));
  console.log(`${path.relative(ROOT, file)} -> ${name}`);
}
