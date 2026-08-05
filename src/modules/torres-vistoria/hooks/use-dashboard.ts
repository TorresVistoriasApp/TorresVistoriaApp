import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/infra/supabase/queries";
import { dashboardService } from "@/modules/torres-vistoria/services/dashboard-service";
import { db } from "@/infra/supabase/client";
import { useUser } from "@/core/auth/user-context";
import { invalidateDashboardQueries } from "@/infra/query/cache-invalidation";

const MAX_TIMEOUT_DELAY = 2_147_483_647;

function getCurrentYear() {
  return new Date().getFullYear();
}

function getNextYearStartDelay() {
  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, 0, 1);
  return nextYear.getTime() - now.getTime();
}

function useCurrentYear() {
  const [year, setYear] = useState(getCurrentYear);

  useEffect(() => {
    let timer: number;
    const scheduleNextCheck = () => {
      const delay = Math.min(getNextYearStartDelay(), MAX_TIMEOUT_DELAY);
      timer = window.setTimeout(() => {
        const nextYear = getCurrentYear();
        setYear(nextYear);

        if (nextYear === year) {
          scheduleNextCheck();
        }
      }, delay);
    };

    scheduleNextCheck();
    return () => window.clearTimeout(timer);
  }, [year]);

  return year;
}

function useDashboardRealtime() {
  const qc = useQueryClient();
  const { tenantId } = useUser();

  useEffect(() => {
    if (!tenantId) return;

    const channel = db
      .channel(`dashboard:${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inspections",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => invalidateDashboardQueries(qc),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "financial_entries",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => invalidateDashboardQueries(qc),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inspection_types",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => invalidateDashboardQueries(qc),
      )
      .subscribe();

    return () => {
      void db.removeChannel(channel);
    };
  }, [tenantId, qc]);
}

export function useDashboardMetrics() {
  const { tenantId } = useUser();
  useDashboardRealtime();

  return useQuery({
    queryKey: queryKeys.dashboard.metrics(tenantId ?? undefined),
    queryFn: () => dashboardService.getMetrics(tenantId!),
    enabled: !!tenantId,
  });
}

export function useRecentInspections() {
  const { tenantId } = useUser();

  return useQuery({
    queryKey: queryKeys.dashboard.recent(tenantId ?? undefined),
    queryFn: () => dashboardService.getRecentInspections(tenantId!),
    enabled: !!tenantId,
  });
}

export function useMonthlyInspections(year?: number) {
  const { tenantId } = useUser();
  const currentYear = useCurrentYear();
  const selectedYear = year ?? currentYear;

  return useQuery({
    queryKey: queryKeys.dashboard.monthly(tenantId ?? undefined, selectedYear),
    queryFn: () => dashboardService.getMonthlyInspections(tenantId!, selectedYear),
    enabled: !!tenantId,
  });
}

export function useInspectionsByBrand() {
  const { tenantId } = useUser();
  return useQuery({
    queryKey: queryKeys.dashboard.brands(tenantId ?? undefined),
    queryFn: () => dashboardService.getInspectionsByBrand(tenantId!),
    enabled: !!tenantId,
  });
}

/** Alias compatível com a spec do Passo 5 */
export const useDashboardStats = useDashboardMetrics;
