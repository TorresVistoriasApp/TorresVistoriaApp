/**
 * Escreve src/types/database.ts a partir de scripts/database-types.raw
 * Gerado pelo Supabase MCP (generate_typescript_types).
 *
 * Uso: node scripts/sync-db-types.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const raw = readFileSync(join(root, "scripts/database-types.raw"), "utf8");
const header = `/**
 * Tipos gerados a partir do schema Supabase (projeto TorresVistorias).
 * Projeto: ljzttzfjtskblxekmquu
 * Regenerar: Supabase MCP generate_typescript_types → scripts/database-types.raw → node scripts/sync-db-types.mjs
 */

`;

writeFileSync(join(root, "src/types/database.ts"), header + raw, "utf8");
console.log("src/types/database.ts atualizado");
