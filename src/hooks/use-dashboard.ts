import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { dashboardService } from "@/services/report-service";
import { db } from "@/lib/db-client";
import { useAuth } from "@/hooks/use-auth";
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
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile?.company_id) return;

    const channel = db
      .channel(`dashboard:${profile.company_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inspections",
          filter: `company_id=eq.${profile.company_id}`,
        },
        () => invalidateDashboardQueries(qc),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "financial_entries",
          filter: `company_id=eq.${profile.company_id}`,
        },
        () => invalidateDashboardQueries(qc),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inspection_types",
          filter: `company_id=eq.${profile.company_id}`,
        },
        () => invalidateDashboardQueries(qc),
      )
      .subscribe();

    return () => {
      void db.removeChannel(channel);
    };
  }, [profile?.company_id, qc]);
}

export function useDashboardMetrics() {
  const { profile } = useAuth();
  useDashboardRealtime();

  return useQuery({
    queryKey: queryKeys.dashboard.metrics,
    queryFn: () => dashboardService.getMetrics(profile!.company_id),
    enabled: !!profile?.company_id,
  });
}

export function useRecentInspections() {
  return useQuery({
    queryKey: queryKeys.dashboard.recent,
    queryFn: () => dashboardService.getRecentInspections(),
  });
}

export function useMonthlyInspections(year?: number) {
  const { profile } = useAuth();
  const currentYear = useCurrentYear();
  const selectedYear = year ?? currentYear;

  return useQuery({
    queryKey: queryKeys.dashboard.monthly(selectedYear),
    queryFn: () => dashboardService.getMonthlyInspections(profile!.company_id, selectedYear),
    enabled: !!profile?.company_id,
  });
}

export function useInspectionsByBrand() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: queryKeys.dashboard.brands,
    queryFn: () => dashboardService.getInspectionsByBrand(profile!.company_id),
    enabled: !!profile?.company_id,
  });
}

/** Alias compatível com a spec do Passo 5 */
export const useDashboardStats = useDashboardMetrics;
