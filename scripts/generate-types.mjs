/**
 * Gera tipos TypeScript a partir do schema do backend.
 * Requer DB_PROJECT_ID no ambiente (ou .env.local).
 *
 * Uso: npm run db:types
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  try {
    const content = readFileSync(join(root, ".env.local"), "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local opcional quando DB_PROJECT_ID já está no ambiente
  }
}

loadEnvLocal();

const projectId = process.env.DB_PROJECT_ID;
if (!projectId) {
  console.error("Defina DB_PROJECT_ID em .env.local ou no ambiente antes de gerar tipos.");
  process.exit(1);
}

const output = execSync(`npx supabase gen types typescript --project-id ${projectId}`, {
  encoding: "utf8",
});

const header = `/**
 * Tipos gerados a partir do schema do backend.
 * Regenerar: npm run db:types
 */

`;

writeFileSync(join(root, "src/types/database.ts"), header + output, "utf8");
console.log("src/types/database.ts atualizado");
