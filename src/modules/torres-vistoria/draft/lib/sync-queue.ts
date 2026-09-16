import { offlineStore } from "@/modules/torres-vistoria/draft/lib/offline-store";
import { syncLogger } from "@/modules/torres-vistoria/draft/lib/sync-logger";
import { photoService } from "@/modules/torres-vistoria/services/photo-service";
import { inspectionService } from "@/modules/torres-vistoria/services/inspection-service";
import type { VistoriaUpdateInput } from "@/modules/torres-vistoria/schemas/vistoria";

const flushOfflineQueueInflight = new Set<string>();

export async function queueInspectionUpdate(
  inspectionId: string,
  payload: Partial<VistoriaUpdateInput> & {
    completion_percent?: number;
    last_auto_saved_at?: string;
  },
): Promise<void> {
  await offlineStore.saveInspectionUpdate({
    inspectionId,
    payload: payload as Record<string, unknown>,
    updatedAt: new Date().toISOString(),
  });
  syncLogger.info("Alteração de vistoria enfileirada offline", { inspectionId });
}

export async function flushOfflineQueue(options: {
  onProgress?: (remaining: number) => void;
} = {}): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  const updates = await offlineStore.listInspectionUpdates();
  for (const update of updates) {
    try {
      await inspectionService.update(
        update.inspectionId,
        update.payload as Partial<VistoriaUpdateInput>,
      );
      await offlineStore.removeInspectionUpdate(update.inspectionId);
      synced += 1;
      syncLogger.info("Vistoria sincronizada", { inspectionId: update.inspectionId });
    } catch (error) {
      failed += 1;
      syncLogger.error("Falha ao sincronizar vistoria", {
        inspectionId: update.inspectionId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const inflightPhotoIds = flushOfflineQueueInflight;
  const photos = await offlineStore.listPhotoUploads();
  for (const pending of photos) {
    if (inflightPhotoIds.has(pending.id)) continue;
    inflightPhotoIds.add(pending.id);
    const claimed = await offlineStore.tryClaimPhotoUpload(pending.id);
    if (!claimed) {
      inflightPhotoIds.delete(pending.id);
      continue;
    }
    try {
      const file = new File([claimed.blob], claimed.fileName, { type: claimed.mimeType });
      await photoService.upload(file, {
        tenantId: claimed.tenantId,
        inspectionId: claimed.inspectionId,
        category: claimed.category,
        latitude: claimed.latitude,
        longitude: claimed.longitude,
        gpsAccuracy: claimed.gpsAccuracy,
        uploadedBy: claimed.uploadedBy,
      });
      await offlineStore.removePhotoUpload(claimed.id);
      synced += 1;
      syncLogger.info("Foto sincronizada", {
        inspectionId: claimed.inspectionId,
        category: claimed.category,
      });
    } catch (error) {
      failed += 1;
      await offlineStore.releasePhotoUploadClaim(claimed.id);
      syncLogger.error("Falha ao sincronizar foto", {
        id: claimed.id,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      inflightPhotoIds.delete(pending.id);
    }
  }

  const remaining = await offlineStore.countPending();
  options.onProgress?.(remaining);

  return { synced, failed };
}

export async function getPendingSyncCount(): Promise<number> {
  return offlineStore.countPending();
}
