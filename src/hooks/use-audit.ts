import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { auditService, type AuditFilters } from "@/services/audit-service";
import { usePermission } from "@/hooks/use-permission";
import { useUser } from "@/hooks/use-user";

export function useAuditLogs(
  filters: AuditFilters = {},
  page = 1,
  pageSize = 50,
) {
  const { companyId } = useUser();
  const { can } = usePermission();
  const offset = (page - 1) * pageSize;
  return useQuery({
    queryKey: queryKeys.audit.list(companyId ?? undefined, filters, page, pageSize),
    queryFn: () => auditService.list(companyId ?? undefined, filters, pageSize, offset),
    enabled: can("users.manage") && !!companyId,
  });
}
