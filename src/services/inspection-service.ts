import { supabase } from "@/lib/supabase";
import { CHECKLIST_CATEGORIES } from "@/lib/constants";
import type { VistoriaInput } from "@/schemas/vistoria";
import type { InspectionStatus } from "@/lib/enums";

export type Inspection = {
  id: string;
  company_id: string;
  inspector_id: string;
  inspection_number: number;
  inspection_date: string;
  inspection_time: string;
  location: string;
  client_name: string;
  client_document: string;
  client_phone: string | null;
  client_email: string | null;
  plate: string;
  chassis: string;
  renavam: string | null;
  brand: string;
  model: string;
  version: string | null;
  color: string;
  fuel: string;
  manufacture_year: number;
  model_year: number;
  mileage: number | null;
  situation: string;
  opinion: string | null;
  technical_notes: string | null;
  internal_notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type InspectionFilters = {
  plate?: string;
  status?: InspectionStatus;
  dateFrom?: string;
  dateTo?: string;
};

function buildChecklistSeed(companyId: string, inspectionId: string) {
  return Object.entries(CHECKLIST_CATEGORIES).flatMap(([category, items]) =>
    items.map((item_name) => ({
      company_id: companyId,
      inspection_id: inspectionId,
      category,
      item_name,
      status: "NA" as const,
    })),
  );
}

export const inspectionService = {
  async list(filters?: InspectionFilters): Promise<Inspection[]> {
    let query = supabase
      .from("inspections")
      .select("*")
      .is("deleted_at", null)
      .order("inspection_date", { ascending: false });

    if (filters?.plate) query = query.ilike("plate", `%${filters.plate}%`);
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.dateFrom) query = query.gte("inspection_date", filters.dateFrom);
    if (filters?.dateTo) query = query.lte("inspection_date", filters.dateTo);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Inspection[];
  },

  async getById(id: string): Promise<Inspection> {
    const { data, error } = await supabase
      .from("inspections")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();
    if (error) throw error;
    return data as Inspection;
  },

  async create(
    input: VistoriaInput,
    meta: { companyId: string; inspectorId: string },
  ): Promise<Inspection> {
    const payload = {
      ...input,
      company_id: meta.companyId,
      inspector_id: meta.inspectorId,
      client_email: input.client_email || null,
      client_phone: input.client_phone || null,
      plate: input.plate.toUpperCase(),
    };

    const { data, error } = await supabase
      .from("inspections")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;

    const checklistRows = buildChecklistSeed(meta.companyId, data.id);
    const { error: checklistError } = await supabase
      .from("inspection_checklists")
      .insert(checklistRows);
    if (checklistError) throw checklistError;

    return data as Inspection;
  },

  async update(id: string, input: Partial<VistoriaInput>): Promise<Inspection> {
    const { data, error } = await supabase
      .from("inspections")
      .update({
        ...input,
        plate: input.plate?.toUpperCase(),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data as Inspection;
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from("inspections")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },
};
