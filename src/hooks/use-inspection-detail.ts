import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { inspectionService } from "@/services/inspection-service";

export function useInspection(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.inspections.detail(id ?? ""),
    queryFn: () => inspectionService.getById(id!),
    enabled: Boolean(id),
  });
}
