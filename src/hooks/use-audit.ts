import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { auditService } from "@/services/audit-service";
import { useAuth } from "@/hooks/use-auth";

export function useAuditLogs() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: queryKeys.audit.all,
    queryFn: () => auditService.list(),
    enabled: profile?.role === "SUPER_ADMIN",
  });
}
