import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { photoService, type InspectionPhoto } from "@/services/photo-service";
import { pdfService } from "@/services/pdf-service";
import { useAuth } from "@/hooks/use-auth";
import { invalidateInspectionQueries } from "@/lib/cache-invalidation";
import { offlineStore } from "@/features/draft/lib/offline-store";
import { useSyncStore } from "@/features/draft/stores/sync-store";
import { syncLogger } from "@/features/draft/lib/sync-logger";
import type { PhotoCaptureMetadata } from "@/lib/photos/types";

export function isPendingPhoto(photo: InspectionPhoto): boolean {
  return photo.id.startsWith("pending-");
}

export function useInspectionPhotos(inspectionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.photos(inspectionId ?? ""),
    queryFn: () => photoService.listByInspection(inspectionId!),
    enabled: Boolean(inspectionId),
  });
}

export function useUploadPhoto(inspectionId: string) {
  const qc = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: ({
      file,
      category,
      latitude,
      longitude,
      gpsAccuracy,
      metadata,
    }: {
      file: File;
      category: string;
      latitude?: number | null;
      longitude?: number | null;
      gpsAccuracy?: number | null;
      metadata?: Partial<PhotoCaptureMetadata>;
    }) => {
      if (!profile?.company_id) throw new Error("Empresa não identificada");
      return photoService.upload(file, {
        companyId: profile.company_id,
        inspectionId,
        category,
        latitude,
        longitude,
        gpsAccuracy,
        uploadedBy: profile.id,
        metadata,
      });
    },
    onMutate: async ({ file, category, latitude, longitude }) => {
      if (!profile?.company_id) return;

      const blobUrl = URL.createObjectURL(file);
      const optimisticId = `pending-${category}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimistic: InspectionPhoto = {
        id: optimisticId,
        inspection_id: inspectionId,
        company_id: profile.company_id,
        category,
        section_key: null,
        subcategory: null,
        display_name: null,
        sort_order: null,
        is_required: null,
        storage_path: "",
        public_url: blobUrl,
        thumbnail_url: blobUrl,
        file_size: file.size,
        mime_type: file.type || "image/jpeg",
        content_hash: null,
        width: null,
        height: null,
        resolution: null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        gps_accuracy: null,
        captured_at: new Date().toISOString(),
        device_model: null,
        device_os: null,
        uploaded_by: profile.id,
        status: "UPLOADING",
        damage_location: null,
        damage_category: null,
        damage_severity: null,
        complementary_name: null,
        complementary_category: null,
        ai_validation: null,
        watermark_applied: false,
        created_at: new Date().toISOString(),
      };

      await qc.cancelQueries({ queryKey: queryKeys.photos(inspectionId) });
      const previous = qc.getQueryData<InspectionPhoto[]>(queryKeys.photos(inspectionId));

      qc.setQueryData<InspectionPhoto[]>(queryKeys.photos(inspectionId), [
        ...(previous ?? []),
        optimistic,
      ]);

      return { previous, blobUrl, optimisticId };
    },
    onSuccess: (data, _variables, context) => {
      if (!context?.optimisticId) return;

      qc.setQueryData<InspectionPhoto[]>(queryKeys.photos(inspectionId), (current) =>
        (current ?? []).map((photo) => (photo.id === context.optimisticId ? data : photo)),
      );

      URL.revokeObjectURL(context.blobUrl);
    },
    onError: async (error, variables, context) => {
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

      if (isOffline && profile?.company_id) {
        const pendingId = `offline-${variables.category}-${Date.now()}`;
        await offlineStore.queuePhotoUpload({
          id: pendingId,
          inspectionId,
          companyId: profile.company_id,
          category: variables.category,
          fileName: variables.file.name || `${Date.now()}.jpg`,
          mimeType: variables.file.type || "image/jpeg",
          blob: variables.file,
          latitude: variables.latitude,
          longitude: variables.longitude,
          gpsAccuracy: variables.gpsAccuracy,
          uploadedBy: profile.id,
          createdAt: new Date().toISOString(),
        });

        useSyncStore.getState().markOffline();
        useSyncStore.getState().markPending();
        syncLogger.warn("Foto enfileirada offline", { inspectionId, category: variables.category });
        return;
      }

      if (context?.previous) {
        qc.setQueryData(queryKeys.photos(inspectionId), context.previous);
      }
      if (context?.blobUrl) {
        URL.revokeObjectURL(context.blobUrl);
      }

      syncLogger.error("Falha no upload de foto", {
        inspectionId,
        error: error instanceof Error ? error.message : String(error),
      });
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.photos(inspectionId) });
      invalidateInspectionQueries(qc, inspectionId);
    },
  });
}

export function useDeletePhoto(inspectionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, storagePath }: { id: string; storagePath: string }) =>
      photoService.remove(id, storagePath),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.photos(inspectionId) });
      invalidateInspectionQueries(qc, inspectionId);
    },
  });
}

export function useGeneratePdfPayload() {
  return useMutation({
    mutationFn: (inspectionId: string) => pdfService.fetchInspectionPayload(inspectionId),
  });
}
