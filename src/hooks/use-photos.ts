import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { photoService, type InspectionPhoto } from "@/services/photo-service";
import { pdfService } from "@/services/pdf-service";
import { useAuth } from "@/hooks/use-auth";
import { invalidateInspectionQueries } from "@/lib/cache-invalidation";

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
    }: {
      file: File;
      category: string;
      latitude?: number | null;
      longitude?: number | null;
    }) => {
      if (!profile?.company_id) throw new Error("Empresa não identificada");
      return photoService.upload(file, {
        companyId: profile.company_id,
        inspectionId,
        category,
        latitude,
        longitude,
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
        storage_path: "",
        public_url: blobUrl,
        file_size: file.size,
        mime_type: file.type || "image/jpeg",
        latitude: latitude ?? null,
        longitude: longitude ?? null,
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
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.photos(inspectionId), context.previous);
      }
      if (context?.blobUrl) {
        URL.revokeObjectURL(context.blobUrl);
      }
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
      invalidateInspectionQueries(qc, inspectionId);
    },
  });
}

export function useGeneratePdfPayload() {
  return useMutation({
    mutationFn: (inspectionId: string) => pdfService.fetchInspectionPayload(inspectionId),
  });
}
