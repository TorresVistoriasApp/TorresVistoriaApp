/**
 * Escreve src/types/database.ts a partir de scripts/database-types.raw
 *
 * Uso: node scripts/sync-db-types.mjs
 * Alternativa direta: npm run db:types
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const raw = readFileSync(join(root, "scripts/database-types.raw"), "utf8");
const header = `/**
 * Tipos gerados a partir do schema do backend.
 * Regenerar: npm run db:types
 */

`;

writeFileSync(join(root, "src/types/database.ts"), header + raw, "utf8");
console.log("src/types/database.ts atualizado");
