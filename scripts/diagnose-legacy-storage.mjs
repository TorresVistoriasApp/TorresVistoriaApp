#!/usr/bin/env node
/**
 * Diagnóstico de objetos legados no Storage (Fase H).
 *
 * Lista paths `pending/` e não canônicos no bucket `reports`.
 * NÃO apaga, NÃO move, NÃO faz upload.
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/diagnose-legacy-storage.mjs
 */

import { createClient } from "@supabase/supabase-js";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Variável de ambiente obrigatória ausente: ${name}`);
    process.exit(1);
  }
  return value;
}

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isCanonicalReportPath(name) {
  const parts = String(name ?? "")
    .split("/")
    .filter(Boolean);
  return (
    parts.length === 3 &&
    UUID.test(parts[0]) &&
    UUID.test(parts[1]) &&
    name.endsWith(".pdf") &&
    !name.startsWith("pending/")
  );
}

async function listAll(supabase, bucket, prefix = "") {
  const pageSize = 100;
  let offset = 0;
  const files = [];

  for (;;) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: pageSize,
      offset,
    });
    if (error) throw error;
    if (!data?.length) break;

    for (const entry of data) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id == null) {
        files.push(...(await listAll(supabase, bucket, path)));
      } else {
        files.push(path);
      }
    }

    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return files;
}

async function main() {
  const supabase = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const names = await listAll(supabase, "reports");
  const pending = names.filter((name) => name.startsWith("pending/"));
  const nonCanonical = names.filter((name) => !isCanonicalReportPath(name));

  console.log(
    JSON.stringify(
      {
        bucket: "reports",
        total: names.length,
        pendingCount: pending.length,
        nonCanonicalCount: nonCanonical.length,
        pendingSample: pending.slice(0, 50),
        nonCanonicalSample: nonCanonical.slice(0, 50),
        deleted: false,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
