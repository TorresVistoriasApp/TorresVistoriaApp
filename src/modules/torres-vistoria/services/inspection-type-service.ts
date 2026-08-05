import { db } from "@/infra/supabase/client";
import { AppError, getErrorMessage, throwIfError } from "@/core/errors/app-error";
import type { InspectionTypeInput, InspectionTypeUpdateInput } from "@/modules/torres-vistoria/schemas/inspection-type";

export type InspectionType = InspectionTypeInput & {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
};

export const inspectionTypeService = {
  async list(tenantId: string, activeOnly = false): Promise<InspectionType[]> {
    try {
      let query = db
        .from("inspection_types")
        .select("*")
        .eq("tenant_id", tenantId)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as InspectionType[];
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async create(input: InspectionTypeInput, tenantId: string): Promise<InspectionType> {
    try {
      return throwIfError(
        await db
          .from("inspection_types")
          .insert({ ...input, tenant_id: tenantId })
          .select("*")
          .single(),
        "Erro ao cadastrar tipo de vistoria",
      ) as InspectionType;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async update(id: string, input: InspectionTypeUpdateInput): Promise<InspectionType> {
    try {
      return throwIfError(
        await db.from("inspection_types").update(input).eq("id", id).select("*").single(),
        "Erro ao atualizar tipo de vistoria",
      ) as InspectionType;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async softDelete(id: string): Promise<void> {
    try {
      const { error } = await db.from("inspection_types").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },
};
