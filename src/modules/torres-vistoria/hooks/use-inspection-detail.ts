import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/infra/supabase/queries";
import { inspectionService } from "@/modules/torres-vistoria/services/inspection-service";

export function useInspection(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.inspections.detail(id ?? ""),
    queryFn: () => inspectionService.getById(id!),
    enabled: Boolean(id),
  });
}
