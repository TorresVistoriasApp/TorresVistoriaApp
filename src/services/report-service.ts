import { supabase } from "@/lib/supabase";
import { financialService } from "@/services/financial-service";
import type { DashboardMetrics } from "@/types";
import type { RecentInspection } from "@/types/api";

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const { count } = await supabase
      .from("inspections")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    const financial = await financialService.getSummary();
    const total = count ?? 0;
    const averageTicket = total > 0 ? financial.revenue / total : 0;

    return {
      totalInspections: total,
      totalRevenue: financial.revenue,
      netProfit: financial.netProfit,
      averageTicket,
    };
  },

  async getRecentInspections(limit = 5): Promise<RecentInspection[]> {
    const { data, error } = await supabase
      .from("inspections")
      .select("id, inspection_number, plate, brand, model, status, inspection_date, client_name")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as RecentInspection[];
  },
};
