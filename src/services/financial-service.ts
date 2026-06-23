import { supabase } from "@/lib/supabase";
import type { FinancialEntryInput } from "@/schemas/financial";
import type { FinancialEntryType } from "@/lib/enums";

export type FinancialEntry = FinancialEntryInput & {
  id: string;
  company_id: string;
  created_by: string;
  created_at: string;
};

export type FinancialSummary = {
  revenue: number;
  expenses: number;
  costs: number;
  netProfit: number;
  margin: number;
};

export const financialService = {
  async list(companyId?: string): Promise<FinancialEntry[]> {
    let query = supabase
      .from("financial_entries")
      .select("*")
      .is("deleted_at", null)
      .order("entry_date", { ascending: false });
    if (companyId) query = query.eq("company_id", companyId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as FinancialEntry[];
  },

  async create(
    input: FinancialEntryInput,
    meta: { companyId: string; userId: string },
  ): Promise<FinancialEntry> {
    const { data, error } = await supabase
      .from("financial_entries")
      .insert({
        ...input,
        company_id: meta.companyId,
        created_by: meta.userId,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as FinancialEntry;
  },

  async getSummary(): Promise<FinancialSummary> {
    const { data, error } = await supabase
      .from("financial_entries")
      .select("entry_type, amount")
      .is("deleted_at", null);
    if (error) throw error;

    const sum = (type: FinancialEntryType) =>
      (data ?? [])
        .filter((r) => r.entry_type === type)
        .reduce((acc, r) => acc + Number(r.amount), 0);

    const revenue = sum("RECEITA");
    const expenses = sum("DESPESA");
    const costs = sum("CUSTO");
    const netProfit = revenue - expenses - costs;
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return { revenue, expenses, costs, netProfit, margin };
  },
};
