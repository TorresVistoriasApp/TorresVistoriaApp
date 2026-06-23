import { supabase } from "@/lib/supabase";
import type { ChecklistItemInput } from "@/schemas/checklist";

export type ChecklistItem = {
  id: string;
  inspection_id: string;
  company_id: string;
  category: string;
  item_name: string;
  status: string;
  notes: string | null;
};

export const checklistService = {
  async listByInspection(inspectionId: string): Promise<ChecklistItem[]> {
    const { data, error } = await supabase
      .from("inspection_checklists")
      .select("*")
      .eq("inspection_id", inspectionId)
      .is("deleted_at", null)
      .order("category")
      .order("item_name");
    if (error) throw error;
    return (data ?? []) as ChecklistItem[];
  },

  async upsertItems(
    inspectionId: string,
    companyId: string,
    items: ChecklistItemInput[],
  ): Promise<void> {
    const rows = items.map((item) => ({
      ...item,
      inspection_id: inspectionId,
      company_id: companyId,
    }));

    const { error } = await supabase
      .from("inspection_checklists")
      .upsert(rows, { onConflict: "inspection_id,category,item_name" });
    if (error) throw error;
  },

  async updateItem(
    id: string,
    patch: Partial<Pick<ChecklistItemInput, "status" | "notes">>,
  ): Promise<void> {
    const { error } = await supabase
      .from("inspection_checklists")
      .update(patch)
      .eq("id", id);
    if (error) throw error;
  },
};
