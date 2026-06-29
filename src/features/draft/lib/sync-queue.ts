import { offlineStore } from "@/features/draft/lib/offline-store";
import { syncLogger } from "@/features/draft/lib/sync-logger";
import { photoService } from "@/services/photo-service";
import { inspectionService } from "@/services/inspection-service";
import type { VistoriaUpdateInput } from "@/schemas/vistoria";

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

  const photos = await offlineStore.listPhotoUploads();
  for (const pending of photos) {
    try {
      const file = new File([pending.blob], pending.fileName, { type: pending.mimeType });
      await photoService.upload(file, {
        companyId: pending.companyId,
        inspectionId: pending.inspectionId,
        category: pending.category,
        latitude: pending.latitude,
        longitude: pending.longitude,
        gpsAccuracy: pending.gpsAccuracy,
        uploadedBy: pending.uploadedBy,
      });
      await offlineStore.removePhotoUpload(pending.id);
      synced += 1;
      syncLogger.info("Foto sincronizada", {
        inspectionId: pending.inspectionId,
        category: pending.category,
      });
    } catch (error) {
      failed += 1;
      syncLogger.error("Falha ao sincronizar foto", {
        id: pending.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const remaining = await offlineStore.countPending();
  options.onProgress?.(remaining);

  return { synced, failed };
}

export async function getPendingSyncCount(): Promise<number> {
  return offlineStore.countPending();
}
