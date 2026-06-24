import { queries } from "@/lib/queries";
import { AppError, getErrorMessage } from "@/lib/errors";
import type { DashboardMetrics } from "@/types";
import type { RecentInspection } from "@/types/api";
import { db } from "@/lib/db-client";

type MonthlyInspectionRow = {
  month: string;
  count: number;
  revenue: number;
};

function createYearlyMonthlySeries(
  rows: MonthlyInspectionRow[],
  year: number,
): MonthlyInspectionRow[] {
  const byMonth = new Map(
    rows.map((row) => [
      row.month,
      {
        month: row.month,
        count: Number(row.count ?? 0),
        revenue: Number(row.revenue ?? 0),
      },
    ]),
  );

  return Array.from({ length: 12 }, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, "0")}`;
    return byMonth.get(month) ?? { month, count: 0, revenue: 0 };
  });
}

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
      const { data, error } = await db
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

  async getMonthlyInspections(companyId: string, year = new Date().getFullYear()) {
    try {
      const { data, error } = await queries.dashboard.monthly(companyId, year);
      if (error) throw error;
      return createYearlyMonthlySeries((data ?? []) as MonthlyInspectionRow[], year);
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
