import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import { useUser } from "@/core/auth/user-context";
import { requireCompanyId } from "@/core/tenant/tenant";

type TenantQueryOptions<TData> = Omit<
  UseQueryOptions<TData, Error, TData, readonly unknown[]>,
  "queryKey" | "queryFn" | "enabled"
> & {
  queryKey: readonly unknown[];
  queryFn: (companyId: string) => Promise<TData>;
  enabled?: boolean;
};

/** React Query com company_id injetado automaticamente da sessão. */
export function useTenantQuery<TData>(
  options: TenantQueryOptions<TData>,
): UseQueryResult<TData, Error> {
  const { companyId } = useUser();
  const { queryKey, queryFn, enabled = true, ...rest } = options;

  return useQuery({
    ...rest,
    queryKey: [...queryKey, companyId] as const,
    queryFn: () => queryFn(requireCompanyId(companyId)),
    enabled: Boolean(companyId) && enabled,
  });
}
