import { db } from "@/infra/supabase/client";
import { buildChecklistSeedRows } from "@/modules/torres-vistoria/domain/checklist/checklist-catalog";
import { queries } from "@/infra/supabase/queries";
import { mutations } from "@/modules/torres-vistoria/repositories/vistoria-mutations";
import { AppError, getErrorMessage, throwIfEdgeError, throwIfError } from "@/core/errors/app-error";
import type { VistoriaInput } from "@/modules/torres-vistoria/schemas/vistoria";
import type { InspectionStatus } from "@/modules/torres-vistoria/domain/enums";
import type { InspectionPhoto } from "@/modules/torres-vistoria/services/photo-service";

async function withInspectionPurpose<T extends Partial<VistoriaInput>>(data: T): Promise<T> {
  if (!data.inspection_type_id) return data;

  const { data: type, error } = await db
    .from("inspection_types")
    .select("name")
    .eq("id", data.inspection_type_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !type?.name) return data;

  return {
    ...data,
    inspection_purpose: type.name,
  };
}

export type Inspection = {
  id: string;
  tenant_id: string;
  inspector_id: string;
  inspection_number: number;
  inspection_date: string;
  inspection_time: string;
  location: string;
  inspection_purpose: string | null;
  inspection_type_id: string | null;
  requester_name: string | null;
  requester_document: string | null;
  buyer_name: string | null;
  buyer_document: string | null;
  seller_name: string | null;
  seller_document: string | null;
  judicial_process: string | null;
  judicial_court: string | null;
  judicial_district: string | null;
  client_name: string;
  client_document: string;
  client_phone: string | null;
  client_email: string | null;
  plate: string;
  chassis: string;
  renavam: string | null;
  motor_number: string | null;
  vehicle_uf: string | null;
  registration_city_uf: string | null;
  vehicle_category: string | null;
  vehicle_species: string | null;
  passenger_capacity: number | null;
  power_cv: number | null;
  engine_displacement: number | null;
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
  market_fipe_value: number | null;
  market_average_value: number | null;
  insurance_acceptance_percent: number | null;
  vehicle_condition: string | null;
  is_armored: boolean;
  status: string;
  completion_percent: number;
  draft_expires_at: string | null;
  last_auto_saved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InspectionProfile = {
  id: string;
  full_name: string;
  role?: string | null;
  avatar_url?: string | null;
};

export type InspectionDetail = Inspection & {
  inspector?: InspectionProfile | null;
  inspection_photos?: InspectionPhoto[];
};

export type InspectionFilters = {
  plate?: string;
  status?: InspectionStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export type InspectionSearchResult = {
  id: string;
  inspection_number: number;
  inspection_date: string;
  client_name: string;
  plate: string;
  brand: string;
  model: string;
  status: string;
  opinion: string | null;
  reporter_name: string | null;
  total_count: number;
};

function buildChecklistSeed(tenantId: string, inspectionId: string) {
  return buildChecklistSeedRows(tenantId, inspectionId);
}

export const inspectionService = {
  async list(
    tenantId: string,
    filters?: InspectionFilters,
  ): Promise<{ data: Inspection[]; count: number }> {
    try {
      const limit = filters?.limit ?? 25;
      const offset = filters?.offset ?? 0;

      let query = queries.inspections
        .byCompany(tenantId, { count: "exact" })
        .order("inspection_date", { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.plate) query = query.ilike("plate", `%${filters.plate}%`);
      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.dateFrom) query = query.gte("inspection_date", filters.dateFrom);
      if (filters?.dateTo) query = query.lte("inspection_date", filters.dateTo);
      if (filters?.search) {
        query = query.or(
          `plate.ilike.%${filters.search}%,client_name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`,
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: (data ?? []) as Inspection[], count: count ?? 0 };
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async search(
    tenantId: string,
    params: Omit<InspectionFilters, "plate"> = {},
  ): Promise<{ data: InspectionSearchResult[]; count: number }> {
    try {
      const { data, error } = await db.rpc("search_inspections", {
        p_tenant_id: tenantId,
        p_query: params.search ?? undefined,
        p_status: params.status ?? undefined,
        p_start_date: params.dateFrom ?? undefined,
        p_end_date: params.dateTo ?? undefined,
        p_limit: params.limit ?? 50,
        p_offset: params.offset ?? 0,
      });
      if (error) throw error;
      const rows = (data ?? []) as InspectionSearchResult[];
      return { data: rows, count: rows[0]?.total_count ?? 0 };
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async getById(id: string): Promise<InspectionDetail> {
    try {
      return throwIfError(
        await queries.inspections.byId(id),
        "Vistoria não encontrada",
      ) as InspectionDetail;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async create(
    input: VistoriaInput,
    meta: { tenantId: string; inspectorId: string },
  ): Promise<Inspection> {
    try {
      const payload = await withInspectionPurpose(input);
      const inspection = throwIfError(
        await mutations.inspections.create(payload, meta.inspectorId, meta.tenantId),
        "Erro ao criar vistoria",
      );

      const checklistRows = buildChecklistSeed(meta.tenantId, inspection.id);
      const { error: checklistError } = await db
        .from("inspection_checklists")
        .insert(checklistRows);
      if (checklistError) throw checklistError;

      return inspection as Inspection;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async update(
    id: string,
    input: Partial<VistoriaInput> & {
      completion_percent?: number;
      last_auto_saved_at?: string;
      draft_expires_at?: string | null;
    },
  ): Promise<Inspection> {
    try {
      const payload = await withInspectionPurpose(input);
      return throwIfError(
        await mutations.inspections.update(id, payload),
        "Erro ao atualizar vistoria",
      ) as Inspection;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async softDelete(id: string): Promise<void> {
    try {
      const { error } = await mutations.inspections.softDelete(id);
      if (error) throw error;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async generateReport(inspectionId: string, storagePath?: string) {
    try {
      const { data, error } = await db.functions.invoke("create-report", {
        body: { inspectionId, storagePath },
      });
      return await throwIfEdgeError(error, data as Record<string, unknown> | null);
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async validateReport(verificationCode: string, captchaToken?: string) {
    try {
      const { data, error } = await db.functions.invoke("validate-report", {
        body: { verificationCode, captchaToken },
      });
      return await throwIfEdgeError(error, data as Record<string, unknown> | null);
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },
};
