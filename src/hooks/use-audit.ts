import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { auditService, type AuditFilters } from "@/services/audit-service";
import { usePermission } from "@/hooks/use-permission";

export function useAuditLogs(
  filters: AuditFilters = {},
  page = 1,
  pageSize = 50,
) {
  const { can } = usePermission();
  const offset = (page - 1) * pageSize;
  return useQuery({
    queryKey: queryKeys.audit.list(filters, page, pageSize),
    queryFn: () => auditService.list(filters, pageSize, offset),
    enabled: can("users.manage"),
  });
}
