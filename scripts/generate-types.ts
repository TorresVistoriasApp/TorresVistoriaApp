/**
 * Gera tipos TypeScript a partir do schema Supabase.
 * Requer: supabase login OU SUPABASE_ACCESS_TOKEN
 *
 * Uso: npx tsx scripts/generate-types.ts
 */
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { SUPABASE_PROJECT_ID } from "../src/lib/constants.ts";

const output = execSync(
  `npx supabase gen types typescript --project-id ${SUPABASE_PROJECT_ID}`,
  { encoding: "utf8" },
);

writeFileSync("src/types/database.ts", output, "utf8");
console.log("✅ Tipos gerados em src/types/database.ts");
