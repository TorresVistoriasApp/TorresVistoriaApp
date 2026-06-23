import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { dashboardService } from "@/services/report-service";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { invalidateDashboardQueries } from "@/lib/cache-invalidation";

function useDashboardRealtime() {
  const qc = useQueryClient();
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile?.company_id) return;

    const channel = supabase
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
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
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
  return useQuery({
    queryKey: queryKeys.dashboard.monthly(year),
    queryFn: () => dashboardService.getMonthlyInspections(profile!.company_id, year),
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
