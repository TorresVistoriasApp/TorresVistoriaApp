import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { dashboardService } from "@/services/report-service";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

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
        () => {
          void qc.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
          void qc.invalidateQueries({ queryKey: queryKeys.dashboard.recent });
          void qc.invalidateQueries({ queryKey: queryKeys.inspections.all });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "financial_entries",
          filter: `company_id=eq.${profile.company_id}`,
        },
        () => {
          void qc.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
          void qc.invalidateQueries({ queryKey: queryKeys.financial.summary });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [profile?.company_id, qc]);
}

export function useDashboardMetrics() {
  useDashboardRealtime();
  return useQuery({
    queryKey: queryKeys.dashboard.metrics,
    queryFn: () => dashboardService.getMetrics(),
  });
}

export function useRecentInspections() {
  return useQuery({
    queryKey: queryKeys.dashboard.recent,
    queryFn: () => dashboardService.getRecentInspections(),
  });
}
