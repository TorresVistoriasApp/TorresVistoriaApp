import { db } from "./db-client";
import type { VistoriaInput } from "@/schemas/vistoria";
import type { FinancialEntryInput } from "@/schemas/financial";

export const mutationKeys = {
  inspection: {
    create: ["inspection", "create"] as const,
    update: (id: string) => ["inspection", "update", id] as const,
    delete: (id: string) => ["inspection", "delete", id] as const,
  },
  financial: {
    create: ["financial", "create"] as const,
    update: (id: string) => ["financial", "update", id] as const,
  },
  photo: {
    upload: (inspectionId: string) => ["photo", "upload", inspectionId] as const,
    delete: (inspectionId: string) => ["photo", "delete", inspectionId] as const,
  },
} as const;

export const mutations = {
  inspections: {
    create(data: VistoriaInput, userId: string, companyId: string) {
      return db
        .from("inspections")
        .insert({
          ...data,
          company_id: companyId,
          inspector_id: userId,
          client_email: data.client_email || null,
          client_phone: data.client_phone || null,
          plate: data.plate.toUpperCase(),
        })
        .select("*")
        .single();
    },

    update(
      id: string,
      data: Partial<VistoriaInput> & {
        completion_percent?: number;
        last_auto_saved_at?: string;
        draft_expires_at?: string | null;
      },
    ) {
      const patch = {
        ...data,
        plate: data.plate?.toUpperCase(),
        inspection_type_id: data.inspection_type_id === "" ? null : data.inspection_type_id,
      };

      return db.from("inspections").update(patch).eq("id", id).select("*").single();
    },

    softDelete(id: string) {
      return db.from("inspections").delete().eq("id", id);
    },
  },

  checklist: {
    updateItem(
      id: string,
      patch: { status?: string; notes?: string | null },
    ) {
      return db
        .from("inspection_checklists")
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();
    },
  },

  financial: {
    create(data: FinancialEntryInput, userId: string, companyId: string) {
      return db
        .from("financial_entries")
        .insert({
          ...data,
          company_id: companyId,
          created_by: userId,
        })
        .select("*")
        .single();
    },

    update(id: string, data: Partial<FinancialEntryInput>) {
      return db.from("financial_entries").update(data).eq("id", id).select("*").single();
    },

    softDelete(id: string) {
      return db
        .from("financial_entries")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
    },
  },

  photos: {
    create(row: {
      company_id: string;
      inspection_id: string;
      category: string;
      storage_path: string;
      public_url: string;
      file_size: number;
      mime_type: string;
      latitude?: number | null;
      longitude?: number | null;
      section_key?: string | null;
      subcategory?: string | null;
      display_name?: string | null;
      sort_order?: number | null;
      is_required?: boolean | null;
      thumbnail_url?: string | null;
      content_hash?: string | null;
      width?: number | null;
      height?: number | null;
      resolution?: string | null;
      gps_accuracy?: number | null;
      captured_at?: string | null;
      device_model?: string | null;
      device_os?: string | null;
      uploaded_by?: string | null;
      status?: string | null;
      damage_location?: string | null;
      damage_category?: string | null;
      damage_severity?: string | null;
      complementary_name?: string | null;
      complementary_category?: string | null;
      ai_validation?: Record<string, unknown> | null;
    }) {
      return db.from("inspection_photos").insert(row as never).select("*").single();
    },

    softDelete(id: string) {
      return db
        .from("inspection_photos")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
    },
  },

  profiles: {
    update(id: string, data: { full_name?: string; role?: string; avatar_url?: string | null }) {
      return db.from("profiles").update(data).eq("id", id).select("*").single();
    },
  },
};
