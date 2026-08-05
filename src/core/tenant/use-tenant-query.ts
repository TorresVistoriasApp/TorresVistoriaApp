import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import { useUser } from "@/core/auth/user-context";
import { requireTenantId } from "@/core/tenant/tenant";

type TenantQueryOptions<TData> = Omit<
  UseQueryOptions<TData, Error, TData, readonly unknown[]>,
  "queryKey" | "queryFn" | "enabled"
> & {
  queryKey: readonly unknown[];
  queryFn: (tenantId: string) => Promise<TData>;
  enabled?: boolean;
};

/** React Query com tenant_id injetado automaticamente da sessão. */
export function useTenantQuery<TData>(
  options: TenantQueryOptions<TData>,
): UseQueryResult<TData, Error> {
  const { tenantId } = useUser();
  const { queryKey, queryFn, enabled = true, ...rest } = options;

  return useQuery({
    ...rest,
    queryKey: [...queryKey, tenantId] as const,
    queryFn: () => queryFn(requireTenantId(tenantId)),
    enabled: Boolean(tenantId) && enabled,
  });
}
