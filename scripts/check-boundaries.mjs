/**
 * Fronteiras de camada (CI, independente do ESLint):
 *   config  <- ninguém
 *   core    <- config, shared
 *   infra   <- config, core, shared
 *   shared  <- config
 *   modules <- camadas acima; entre módulos, só pelo barrel
 *   layouts/routes/providers <- camadas acima
 */
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve(import.meta.dirname, "../src");

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const violations = new Map();

for (const file of walk(SRC)) {
  const rel = path.relative(SRC, file).replace(/\\/g, "/");
  const layer = rel.split("/")[0];
  const owner = layer === "modules" ? rel.split("/")[1] : null;
  const code = fs.readFileSync(file, "utf8");

  for (const match of code.matchAll(/from "(@\/[^"]+)"/g)) {
    const spec = match[1];
    const targetModule = spec.match(/^@\/modules\/([^/]+)/)?.[1];
    const isPublicBarrel = spec === `@/modules/${targetModule}`;
    let reason = null;

    if (owner && targetModule && targetModule !== owner && !isPublicBarrel) {
      reason = `import interno entre módulos: ${owner} -> ${targetModule}`;
    } else if (!owner && targetModule && ["shared", "core", "infra", "config"].includes(layer)) {
      reason = `${layer} não pode depender de módulos (${targetModule})`;
    } else if (layer === "shared" && /^@\/(core|infra|layouts|routes)\//.test(spec)) {
      reason = `shared não pode depender de ${spec.split("/")[1]}`;
    } else if (layer === "core" && /^@\/layouts\//.test(spec)) {
      reason = "core não pode depender de layouts";
    }

    if (reason) {
      if (!violations.has(reason)) violations.set(reason, []);
      violations.get(reason).push(`${rel}  (${spec})`);
    }
  }
}

if (!violations.size) {
  console.log("Fronteiras da arquitetura: OK");
  process.exit(0);
}

for (const [reason, files] of [...violations].sort()) {
  console.error(`\n${reason} (${files.length})`);
  for (const f of files) console.error("   " + f);
}
process.exit(1);
