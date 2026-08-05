import { db } from "@/infra/supabase/client";
import { mutations } from "@/modules/torres-vistoria/repositories/vistoria-mutations";
import { queries } from "@/infra/supabase/queries";
import { buildChecklistSeedRows } from "@/modules/torres-vistoria/domain/checklist/checklist-catalog";
import { computeInspectionCompletionPercent } from "@/modules/torres-vistoria/draft/lib/completion-percent";
import { buildEmptyDraftInput } from "@/modules/torres-vistoria/draft/lib/draft-defaults";
import { syncLogger } from "@/modules/torres-vistoria/draft/lib/sync-logger";
import { ACTIVE_DRAFT_STORAGE_KEY } from "@/modules/torres-vistoria/draft/lib/constants";
import type { ActiveDraftSummary } from "@/modules/torres-vistoria/draft/types";
import { AppError, getErrorMessage, throwIfError } from "@/core/errors/app-error";
import { InspectionStatus } from "@/modules/torres-vistoria/domain/enums";
import { STORAGE_BUCKET } from "@/infra/storage/buckets";
import type { VistoriaInput, VistoriaUpdateInput } from "@/modules/torres-vistoria/schemas/vistoria";
import { inspectionService, type Inspection } from "@/modules/torres-vistoria/services/inspection-service";

function draftSelectFields() {
  return `
    id, inspection_number, client_name, plate, completion_percent,
    created_at, updated_at, draft_expires_at, last_auto_saved_at, status
  `;
}

function isDraftExpired(draft: { draft_expires_at: string | null }): boolean {
  if (!draft.draft_expires_at) return false;
  return new Date(draft.draft_expires_at).getTime() <= Date.now();
}

export function rememberActiveDraftId(id: string | null) {
  if (id) {
    localStorage.setItem(ACTIVE_DRAFT_STORAGE_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_DRAFT_STORAGE_KEY);
  }
}

export function getRememberedActiveDraftId(): string | null {
  return localStorage.getItem(ACTIVE_DRAFT_STORAGE_KEY);
}

export const draftService = {
  async findActiveDraft(
    tenantId: string,
    inspectorId: string,
  ): Promise<ActiveDraftSummary | null> {
    try {
      const { data, error } = await db
        .from("inspections")
        .select(draftSelectFields())
        .eq("tenant_id", tenantId)
        .eq("inspector_id", inspectorId)
        .eq("status", InspectionStatus.DRAFT)
        .is("deleted_at", null)
        .gt("draft_expires_at", new Date().toISOString())
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const draft = data as unknown as ActiveDraftSummary;
      if (isDraftExpired(draft)) return null;

      return draft;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async createEmptyDraft(meta: {
    tenantId: string;
    inspectorId: string;
  }): Promise<Inspection> {
    try {
      const input = buildEmptyDraftInput();
      const inspection = throwIfError(
        await mutations.inspections.create(input, meta.inspectorId, meta.tenantId),
        "Erro ao criar rascunho",
      );

      const checklistRows = buildChecklistSeedRows(meta.tenantId, inspection.id);
      const { error: checklistError } = await db.from("inspection_checklists").insert(checklistRows);
      if (checklistError) throw checklistError;

      rememberActiveDraftId(inspection.id);
      syncLogger.info("Rascunho criado", { inspectionId: inspection.id });

      return inspection as Inspection;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async autoSave(
    id: string,
    input: Partial<VistoriaUpdateInput>,
    completionPercent?: number,
  ): Promise<Inspection> {
    try {
      const payload: Partial<VistoriaInput> & {
        completion_percent?: number;
        last_auto_saved_at?: string;
      } = {
        ...input,
        last_auto_saved_at: new Date().toISOString(),
      };

      if (completionPercent != null) {
        payload.completion_percent = completionPercent;
      }

      if (payload.inspection_type_id === "") {
        delete payload.inspection_type_id;
      }

      const updated = await inspectionService.update(id, payload);

      syncLogger.info("Auto-save concluído", { inspectionId: id });
      return updated;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async updateCompletionPercent(id: string): Promise<number> {
    try {
      const inspection = throwIfError(
        await queries.inspections.byId(id),
        "Vistoria não encontrada",
      ) as Inspection;

      const [{ data: photos }, { data: checklist }] = await Promise.all([
        queries.photos.byInspection(id),
        queries.checklist.byInspection(id),
      ]);

      const percent = computeInspectionCompletionPercent({
        inspection,
        photos: (photos ?? []) as never[],
        checklist: (checklist ?? []).map((item, index) => ({
          id: String((item as { id?: string }).id ?? index),
          status: (item as { status: string }).status,
        })) as never[],
      });

      await mutations.inspections.update(id, {
        completion_percent: percent,
        last_auto_saved_at: new Date().toISOString(),
      });

      return percent;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async deleteDraft(id: string): Promise<void> {
    try {
      const { data: photos, error: photosError } = await queries.photos.byInspection(id);
      if (photosError) throw photosError;

      const storagePaths = (photos ?? [])
        .map((photo) => photo.storage_path)
        .filter(Boolean);

      if (storagePaths.length > 0) {
        await db.storage.from(STORAGE_BUCKET).remove(storagePaths);
      }

      const { error } = await mutations.inspections.softDelete(id);
      if (error) throw error;

      if (getRememberedActiveDraftId() === id) {
        rememberActiveDraftId(null);
      }

      syncLogger.info("Rascunho excluído", { inspectionId: id });
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async cleanupExpiredDrafts(): Promise<number> {
    try {
      const { data, error } = await db.rpc("cleanup_expired_inspection_drafts");
      if (error) throw error;
      const removed = typeof data === "number" ? data : 0;
      if (removed > 0) {
        syncLogger.info("Rascunhos expirados removidos", { removed });
      }
      return removed;
    } catch (error) {
      syncLogger.warn("Limpeza via RPC indisponível, tentando localmente", {
        error: getErrorMessage(error),
      });
      return 0;
    }
  },

  isExpired(draft: { draft_expires_at: string | null }): boolean {
    return isDraftExpired(draft);
  },

  getRemainingMs(draft: { draft_expires_at: string | null }): number {
    if (!draft.draft_expires_at) return 0;
    return Math.max(0, new Date(draft.draft_expires_at).getTime() - Date.now());
  },
};
