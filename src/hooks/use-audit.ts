import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { auditService, type AuditFilters } from "@/services/audit-service";
import { useAuth } from "@/hooks/use-auth";

export function useAuditLogs(
  filters: AuditFilters = {},
  page = 1,
  pageSize = 50,
) {
  const { profile } = useAuth();
  const offset = (page - 1) * pageSize;
  return useQuery({
    queryKey: queryKeys.audit.list(filters, page, pageSize),
    queryFn: () => auditService.list(filters, pageSize, offset),
    enabled: profile?.role === "SUPER_ADMIN",
  });
}
