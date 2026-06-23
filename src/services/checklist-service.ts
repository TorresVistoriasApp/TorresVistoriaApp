import { supabase } from "@/lib/supabase";
import { queries } from "@/lib/queries";
import { mutations } from "@/lib/mutations";
import { AppError, getErrorMessage, throwIfError } from "@/lib/errors";
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
    try {
      const { data, error } = await queries.checklist.byInspection(inspectionId);
      if (error) throw error;
      return (data ?? []) as ChecklistItem[];
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async upsertItems(
    inspectionId: string,
    companyId: string,
    items: ChecklistItemInput[],
  ): Promise<void> {
    try {
      const rows = items.map(({ photo_ids: _photoIds, ...item }) => ({
        ...item,
        inspection_id: inspectionId,
        company_id: companyId,
      }));
      const { error } = await supabase
        .from("inspection_checklists")
        .upsert(rows, { onConflict: "inspection_id,category,item_name" });
      if (error) throw error;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async updateItem(
    id: string,
    patch: Partial<Pick<ChecklistItemInput, "status" | "notes">>,
  ): Promise<ChecklistItem> {
    try {
      return throwIfError(
        await mutations.checklist.updateItem(id, patch),
        "Erro ao atualizar item do checklist",
      ) as ChecklistItem;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },
};
