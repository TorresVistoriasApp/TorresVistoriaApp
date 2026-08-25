import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPreviewObjectUrl } from "@/shared/lib/compress-image";
import { queryKeys } from "@/infra/supabase/queries";
import { photoService, type InspectionPhoto } from "@/modules/torres-vistoria/services/photo-service";
import { useUser } from "@/core/auth/user-context";
import { offlineStore } from "@/modules/torres-vistoria/draft/lib/offline-store";
import { useSyncStore } from "@/modules/torres-vistoria/draft/stores/sync-store";
import { syncLogger } from "@/modules/torres-vistoria/draft/lib/sync-logger";
import type { PhotoCaptureMetadata } from "@/modules/torres-vistoria/domain/photos/types";

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
  const { tenantId, userId } = useUser();

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
      if (!tenantId) throw new Error("Empresa não identificada");
      return photoService.upload(file, {
        tenantId,
        inspectionId,
        category,
        latitude,
        longitude,
        gpsAccuracy,
        uploadedBy: userId,
        metadata,
      });
    },
    onMutate: async ({ file, category, latitude, longitude }) => {
      if (!tenantId) return;

      const optimisticId = `pending-${category}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const preview = { url: null as string | null, cancelled: false };
      const optimistic: InspectionPhoto = {
        id: optimisticId,
        inspection_id: inspectionId,
        tenant_id: tenantId,
        category,
        section_key: null,
        subcategory: null,
        display_name: null,
        sort_order: null,
        is_required: null,
        storage_path: "",
        public_url: null,
        thumbnail_url: null,
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
        uploaded_by: userId,
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

      qc.setQueryData<InspectionPhoto[]>(queryKeys.photos(inspectionId), (current) => [
        ...(current ?? []),
        optimistic,
      ]);

      void createPreviewObjectUrl(file).then((url) => {
        if (preview.cancelled) {
          URL.revokeObjectURL(url);
          return;
        }

        const current = qc.getQueryData<InspectionPhoto[]>(queryKeys.photos(inspectionId));
        if (!current?.some((photo) => photo.id === optimisticId)) {
          URL.revokeObjectURL(url);
          return;
        }

        preview.url = url;
        qc.setQueryData<InspectionPhoto[]>(queryKeys.photos(inspectionId), (photos) =>
          (photos ?? []).map((photo) =>
            photo.id === optimisticId
              ? { ...photo, public_url: url, thumbnail_url: url }
              : photo,
          ),
        );
      });

      return { optimisticId, preview };
    },
    onSuccess: (data, _variables, context) => {
      if (!context?.optimisticId) return;

      context.preview.cancelled = true;
      const previewUrl = context.preview.url;

      qc.setQueryData<InspectionPhoto[]>(queryKeys.photos(inspectionId), (current) => {
        const list = current ?? [];
        const hasOptimistic = list.some((photo) => photo.id === context.optimisticId);
        if (!hasOptimistic) return [...list, data];
        return list.map((photo) => (photo.id === context.optimisticId ? data : photo));
      });

      if (previewUrl) {
        window.setTimeout(() => URL.revokeObjectURL(previewUrl), 0);
      }
    },
    onError: async (error, variables, context) => {
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

      if (isOffline && tenantId && context?.optimisticId) {
        const pendingId = `offline-${variables.category}-${Date.now()}`;
        await offlineStore.queuePhotoUpload({
          id: pendingId,
          inspectionId,
          tenantId,
          category: variables.category,
          fileName: variables.file.name || `${Date.now()}.jpg`,
          mimeType: variables.file.type || "image/jpeg",
          blob: variables.file,
          latitude: variables.latitude,
          longitude: variables.longitude,
          gpsAccuracy: variables.gpsAccuracy,
          uploadedBy: userId,
          createdAt: new Date().toISOString(),
        });

        qc.setQueryData<InspectionPhoto[]>(queryKeys.photos(inspectionId), (current) =>
          (current ?? []).map((photo) =>
            photo.id === context.optimisticId
              ? { ...photo, id: pendingId, status: "CAPTURED" }
              : photo,
          ),
        );

        useSyncStore.getState().markOffline();
        useSyncStore.getState().markPending();
        syncLogger.warn("Foto enfileirada offline", { inspectionId, category: variables.category });
        return;
      }

      if (context?.preview) {
        context.preview.cancelled = true;
        if (context.preview.url) {
          URL.revokeObjectURL(context.preview.url);
        }
      }

      qc.setQueryData<InspectionPhoto[]>(queryKeys.photos(inspectionId), (current) =>
        (current ?? []).filter((photo) => photo.id !== context?.optimisticId),
      );

      syncLogger.error("Falha no upload de foto", {
        inspectionId,
        error: error instanceof Error ? error.message : String(error),
      });
    },
    onSettled: (_data, error) => {
      if (error) {
        void qc.invalidateQueries({ queryKey: queryKeys.photos(inspectionId) });
      }
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
    },
  });
}
