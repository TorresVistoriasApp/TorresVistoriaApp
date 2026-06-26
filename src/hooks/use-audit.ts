import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { auditService, type AuditFilters } from "@/services/audit-service";
import { useAuth } from "@/hooks/use-auth";

export function useAuditLogs(filters: AuditFilters = {}) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: queryKeys.audit.list(filters),
    queryFn: () => auditService.list(filters),
    enabled: profile?.role === "SUPER_ADMIN",
  });
}
