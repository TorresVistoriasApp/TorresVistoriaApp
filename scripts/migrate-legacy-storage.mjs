#!/usr/bin/env node
/**
 * ETAPA 13 — Migração física de arquivos no Supabase Storage.
 *
 * Lê `legacy_storage_path_map` (populada pela migration SQL) e copia cada
 * objeto de old_path → new_path. Requer service role.
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-legacy-storage.mjs
 *   node scripts/migrate-legacy-storage.mjs --dry-run
 */

import { createClient } from "@supabase/supabase-js";

const DRY_RUN = process.argv.includes("--dry-run");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Variável de ambiente obrigatória ausente: ${name}`);
    process.exit(1);
  }
  return value;
}

const supabase = createClient(
  requireEnv("SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function fetchPendingMappings() {
  const { data, error } = await supabase
    .from("legacy_storage_path_map")
    .select("bucket_id, old_path, new_path")
    .is("migrated_at", null)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

async function copyObject(bucketId, oldPath, newPath) {
  const { error: copyError } = await supabase.storage.from(bucketId).copy(oldPath, newPath);
  if (copyError) {
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from(bucketId)
      .download(oldPath);

    if (downloadError) throw downloadError;

    const { error: uploadError } = await supabase.storage
      .from(bucketId)
      .upload(newPath, downloadData, { upsert: true, contentType: downloadData.type });

    if (uploadError) throw uploadError;
    return;
  }
}

async function removeOldObject(bucketId, oldPath, newPath) {
  if (oldPath === newPath) return;
  const { error } = await supabase.storage.from(bucketId).remove([oldPath]);
  if (error) {
    console.warn(`  aviso: não foi possível remover ${oldPath}: ${error.message}`);
  }
}

async function markMigrated(bucketId, oldPath) {
  const { error } = await supabase
    .from("legacy_storage_path_map")
    .update({ migrated_at: new Date().toISOString() })
    .eq("bucket_id", bucketId)
    .eq("old_path", oldPath);

  if (error) throw error;
}

async function main() {
  const pending = await fetchPendingMappings();

  if (pending.length === 0) {
    console.log("Nenhum path pendente em legacy_storage_path_map.");
    return;
  }

  console.log(
    `${DRY_RUN ? "[dry-run] " : ""}${pending.length} objeto(s) pendente(s) de migração.`,
  );

  let success = 0;
  let failed = 0;

  for (const row of pending) {
    const { bucket_id: bucketId, old_path: oldPath, new_path: newPath } = row;

    if (oldPath === newPath) {
      console.log(`• ${bucketId}: ${oldPath} (já canônico, marcando)`);
      if (!DRY_RUN) await markMigrated(bucketId, oldPath);
      success += 1;
      continue;
    }

    try {
      console.log(`• ${bucketId}: ${oldPath} → ${newPath}`);
      if (!DRY_RUN) {
        await copyObject(bucketId, oldPath, newPath);
        await removeOldObject(bucketId, oldPath, newPath);
        await markMigrated(bucketId, oldPath);
      }
      success += 1;
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  erro: ${message}`);
    }
  }

  console.log(`\nConcluído: ${success} ok, ${failed} falha(s).`);
  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
