import { db } from "@/infra/supabase/client";
import { buildChecklistSeedRows } from "@/modules/torres-vistoria/domain/checklist/checklist-catalog";
import { queries } from "@/infra/supabase/queries";
import { mutations } from "@/modules/torres-vistoria/repositories/vistoria-mutations";
import { AppError, getErrorMessage, throwIfError } from "@/core/errors/app-error";
import type { ChecklistItemInput } from "@/modules/torres-vistoria/schemas/checklist";

export type ChecklistItem = {
  id: string;
  inspection_id: string;
  tenant_id: string;
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

  /** Insere itens do catálogo atual que ainda não existem na vistoria. */
  async syncWithCatalog(inspectionId: string, tenantId: string): Promise<ChecklistItem[]> {
    try {
      const existing = await this.listByInspection(inspectionId);
      const existingKeys = new Set(existing.map((i) => `${i.category}::${i.item_name}`));
      const missing = buildChecklistSeedRows(tenantId, inspectionId).filter(
        (row) => !existingKeys.has(`${row.category}::${row.item_name}`),
      );

      if (missing.length > 0) {
        const { error } = await db.from("inspection_checklists").insert(missing);
        if (error) throw error;
      }

      return this.listByInspection(inspectionId);
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async upsertItems(
    inspectionId: string,
    tenantId: string,
    items: ChecklistItemInput[],
  ): Promise<void> {
    try {
      const rows = items.map(({ photo_ids: _photoIds, ...item }) => ({
        ...item,
        inspection_id: inspectionId,
        tenant_id: tenantId,
      }));
      const { error } = await db
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
