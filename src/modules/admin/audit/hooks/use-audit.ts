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
  const { tenantId } = useUser();
  const { can } = usePermission();
  const offset = (page - 1) * pageSize;
  return useQuery({
    queryKey: queryKeys.audit.list(tenantId ?? undefined, filters, page, pageSize),
    queryFn: () => auditService.list(tenantId ?? undefined, filters, pageSize, offset),
    enabled: can("users.manage") && !!tenantId,
  });
}
