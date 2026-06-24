import { db } from "@/lib/db-client";
import { queries } from "@/lib/queries";
import { mutations } from "@/lib/mutations";
import { AppError, getErrorMessage, throwIfError } from "@/lib/errors";
import type { FinancialEntryInput } from "@/schemas/financial";
import type { FinancialEntryType } from "@/lib/enums";

export type FinancialEntry = FinancialEntryInput & {
  id: string;
  company_id: string;
  created_by: string;
  created_at: string;
};

export type FinancialSummary = {
  totalRevenue: number;
  totalExpenses: number;
  totalCosts: number;
  netProfit: number;
  margin: number;
  /** @deprecated use totalRevenue */
  revenue: number;
  /** @deprecated use totalExpenses */
  expenses: number;
};

function defaultDateRange() {
  const now = new Date();
  const start = `${now.getFullYear()}-01-01`;
  const end = now.toISOString().slice(0, 10);
  return { start, end };
}

export const financialService = {
  async list(companyId?: string): Promise<FinancialEntry[]> {
    try {
      if (!companyId) return [];
      const { data, error } = await queries.financial.byCompany(companyId);
      if (error) throw error;
      return (data ?? []) as FinancialEntry[];
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async getSummary(companyId: string, startDate?: string, endDate?: string): Promise<FinancialSummary> {
    try {
      const range = defaultDateRange();
      const { data, error } = await queries.financial.summary(
        companyId,
        startDate ?? range.start,
        endDate ?? range.end,
      );
      if (error) throw error;

      const summary = data as Record<string, number> | null;
      const totalRevenue = Number(summary?.totalRevenue ?? 0);
      const totalExpenses = Number(summary?.totalExpenses ?? 0);
      const totalCosts = Number(summary?.totalCosts ?? 0);
      const netProfit = Number(summary?.netProfit ?? 0);
      const margin = Number(summary?.margin ?? 0);
      return {
        totalRevenue,
        totalExpenses,
        totalCosts,
        netProfit,
        margin,
        revenue: totalRevenue,
        expenses: totalExpenses + totalCosts,
      };
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async create(
    input: FinancialEntryInput,
    meta: { companyId: string; userId: string },
  ): Promise<FinancialEntry> {
    try {
      return throwIfError(
        await mutations.financial.create(input, meta.userId, meta.companyId),
        "Erro ao criar lançamento",
      ) as FinancialEntry;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async update(id: string, input: Partial<FinancialEntryInput>): Promise<FinancialEntry> {
    try {
      return throwIfError(
        await mutations.financial.update(id, input),
        "Erro ao atualizar lançamento",
      ) as FinancialEntry;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async softDelete(id: string): Promise<void> {
    try {
      const { error } = await mutations.financial.softDelete(id);
      if (error) throw error;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  /** Resumo local (fallback quando RPC indisponível). */
  async getLocalSummary(type?: FinancialEntryType): Promise<{
    revenue: number;
    expenses: number;
    costs: number;
    netProfit: number;
    margin: number;
  }> {
    try {
      const { data, error } = await db
        .from("financial_entries")
        .select("entry_type, amount")
        .is("deleted_at", null);
      if (error) throw error;

      const sum = (entryType: FinancialEntryType) =>
        (data ?? [])
          .filter((r) => r.entry_type === entryType)
          .reduce((acc, r) => acc + Number(r.amount), 0);

      const revenue = sum("RECEITA");
      const expenses = sum("DESPESA");
      const costs = sum("CUSTO");
      const netProfit = revenue - expenses - costs;
      const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

      if (type) {
        return { revenue, expenses, costs, netProfit, margin };
      }
      return { revenue, expenses, costs, netProfit, margin };
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },
};
