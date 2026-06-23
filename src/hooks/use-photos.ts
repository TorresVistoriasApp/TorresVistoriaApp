import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { photoService } from "@/services/photo-service";
import { pdfService } from "@/services/pdf-service";
import { useAuth } from "@/hooks/use-auth";
import { invalidateInspectionQueries } from "@/lib/cache-invalidation";

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
    onSuccess: () => {
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
