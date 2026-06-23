import { queries } from "@/lib/queries";
import { AppError, getErrorMessage } from "@/lib/errors";
import type { DashboardMetrics } from "@/types";
import type { RecentInspection } from "@/types/api";
import { supabase } from "@/lib/supabase";

export const dashboardService = {
  async getMetrics(companyId: string): Promise<DashboardMetrics> {
    try {
      const { data, error } = await queries.dashboard.stats(companyId);
      if (error) throw error;
      const stats = data as Record<string, number> | null;
      return {
        totalInspections: Number(stats?.totalInspections ?? 0),
        totalRevenue: Number(stats?.totalRevenue ?? 0),
        netProfit: Number(stats?.netProfit ?? 0),
        averageTicket: Number(stats?.averageTicket ?? 0),
      };
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async getRecentInspections(limit = 5): Promise<RecentInspection[]> {
    try {
      const { data, error } = await supabase
        .from("inspections")
        .select("id, inspection_number, plate, brand, model, status, inspection_date, client_name")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as RecentInspection[];
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async getMonthlyInspections(companyId: string, year?: number) {
    try {
      const { data, error } = await queries.dashboard.monthly(companyId, year);
      if (error) throw error;
      return data ?? [];
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async getInspectionsByBrand(companyId: string) {
    try {
      const { data, error } = await queries.dashboard.byBrand(companyId);
      if (error) throw error;
      return data ?? [];
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },
};
