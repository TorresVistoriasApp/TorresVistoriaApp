import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { dashboardService } from "@/services/report-service";
import { db } from "@/lib/db-client";
import { useUser } from "@/hooks/use-user";
import { invalidateDashboardQueries } from "@/lib/cache-invalidation";

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
  const { companyId } = useUser();

  useEffect(() => {
    if (!companyId) return;

    const channel = db
      .channel(`dashboard:${companyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inspections",
          filter: `company_id=eq.${companyId}`,
        },
        () => invalidateDashboardQueries(qc),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "financial_entries",
          filter: `company_id=eq.${companyId}`,
        },
        () => invalidateDashboardQueries(qc),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inspection_types",
          filter: `company_id=eq.${companyId}`,
        },
        () => invalidateDashboardQueries(qc),
      )
      .subscribe();

    return () => {
      void db.removeChannel(channel);
    };
  }, [companyId, qc]);
}

export function useDashboardMetrics() {
  const { companyId } = useUser();
  useDashboardRealtime();

  return useQuery({
    queryKey: queryKeys.dashboard.metrics(companyId ?? undefined),
    queryFn: () => dashboardService.getMetrics(companyId!),
    enabled: !!companyId,
  });
}

export function useRecentInspections() {
  const { companyId } = useUser();

  return useQuery({
    queryKey: queryKeys.dashboard.recent(companyId ?? undefined),
    queryFn: () => dashboardService.getRecentInspections(companyId!),
    enabled: !!companyId,
  });
}

export function useMonthlyInspections(year?: number) {
  const { companyId } = useUser();
  const currentYear = useCurrentYear();
  const selectedYear = year ?? currentYear;

  return useQuery({
    queryKey: queryKeys.dashboard.monthly(companyId ?? undefined, selectedYear),
    queryFn: () => dashboardService.getMonthlyInspections(companyId!, selectedYear),
    enabled: !!companyId,
  });
}

export function useInspectionsByBrand() {
  const { companyId } = useUser();
  return useQuery({
    queryKey: queryKeys.dashboard.brands(companyId ?? undefined),
    queryFn: () => dashboardService.getInspectionsByBrand(companyId!),
    enabled: !!companyId,
  });
}

/** Alias compatível com a spec do Passo 5 */
export const useDashboardStats = useDashboardMetrics;
