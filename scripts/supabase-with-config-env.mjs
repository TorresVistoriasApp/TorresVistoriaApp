/**
 * Supabase CLI valida auth.hook.send_email.secrets em config.toml mesmo em
 * `db push` (só migrations). Se SEND_EMAIL_HOOK_SECRET não estiver definido,
 * usa placeholder local — não altera o secret de produção no Dashboard.
 */
import { spawnSync } from "node:child_process";

const PLACEHOLDER =
  "v1,whsec_bG9jYWxDbGlab25seVZhbGlkYXRpb25QbGFjZWhvbGRlcg==";

const env = { ...process.env };
if (!env.SEND_EMAIL_HOOK_SECRET?.trim()) {
  env.SEND_EMAIL_HOOK_SECRET = PLACEHOLDER;
}

const args = process.argv.slice(2);
const result = spawnSync("supabase", args, {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
