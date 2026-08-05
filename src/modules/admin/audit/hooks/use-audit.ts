import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/infra/supabase/queries";
import { auditService, type AuditFilters } from "@/core/audit/audit-service";
import { usePermission } from "@/core/rbac/use-permission";
import { useUser } from "@/core/auth/user-context";

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
