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
    let reason = null;

    const isPublicBarrel = spec === `@/modules/${targetModule}`;

    if (owner && targetModule && targetModule !== owner && !isPublicBarrel) {
      reason = `cross-module fora do barrel: ${owner} -> ${targetModule}`;
    } else if (!owner && targetModule && ["shared", "core", "infra", "config"].includes(layer)) {
      reason = `${layer} -> modules/${targetModule}`;
    } else if (layer === "shared" && /^@\/(core|infra|layouts|routes)\//.test(spec)) {
      reason = `shared -> ${spec.split("/")[1]}`;
    } else if (layer === "core" && /^@\/layouts\//.test(spec)) {
      reason = "core -> layouts";
    }

    if (reason) {
      if (!violations.has(reason)) violations.set(reason, []);
      violations.get(reason).push(`${rel}  (${spec})`);
    }
  }
}

for (const [reason, files] of [...violations].sort()) {
  console.log(`\n== ${reason} (${files.length})`);
  for (const f of files.slice(0, 8)) console.log("   " + f);
}
if (!violations.size) console.log("Nenhuma violação de fronteira.");
