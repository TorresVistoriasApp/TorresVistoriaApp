import { db } from "./db-client";

export const queryKeys = {
  inspections: {
    all: ["inspections"] as const,
    list: (filters?: Record<string, unknown>) => ["inspections", "list", filters] as const,
    detail: (id: string) => ["inspections", id] as const,
    search: (params?: Record<string, unknown>) => ["inspections", "search", params] as const,
  },
  checklist: (inspectionId: string) => ["checklist", inspectionId] as const,
  photos: (inspectionId: string) => ["photos", inspectionId] as const,
  dashboard: {
    metrics: ["dashboard", "metrics"] as const,
    recent: ["dashboard", "recent"] as const,
    monthly: (year?: number) => ["dashboard", "monthly", year] as const,
    brands: ["dashboard", "brands"] as const,
  },
  financial: {
    all: ["financial"] as const,
    summary: (startDate?: string, endDate?: string) =>
      ["financial", "summary", startDate, endDate] as const,
  },
  profile: ["profile"] as const,
  company: {
    detail: (id: string) => ["company", id] as const,
    settings: (id: string) => ["company", id, "settings"] as const,
  },
  inspectionTypes: {
    all: ["inspection-types"] as const,
    list: (companyId?: string, activeOnly?: boolean) =>
      ["inspection-types", companyId, activeOnly] as const,
  },
  users: {
    team: ["users", "team"] as const,
  },
  audit: {
    all: ["audit"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
} as const;

export const queries = {
  inspections: {
    base() {
      return db.from("inspections").select(`
        id, inspection_number, inspection_date, inspection_time, location,
        inspection_purpose, inspection_type_id, requester_name, requester_document,
        buyer_name, buyer_document, seller_name, seller_document,
        judicial_process, judicial_court, judicial_district,
        client_name, client_document, client_phone, client_email,
        plate, chassis, renavam, brand, model, version, color,
        motor_number, vehicle_uf, registration_city_uf, vehicle_category, vehicle_species,
        passenger_capacity, power_cv, engine_displacement,
        fuel, manufacture_year, model_year, mileage,
        market_fipe_value, market_average_value, insurance_acceptance_percent, vehicle_condition,
        situation, opinion, status, technical_notes, internal_notes,
        company_id, inspector_id, created_at, updated_at,
        inspector:profiles!inspections_inspector_id_fkey(id, full_name, avatar_url, role)
      `);
    },

    withRelations() {
      return db.from("inspections").select(`
        *,
        inspector:profiles!inspections_inspector_id_fkey(id, full_name, avatar_url, role),
        inspection_checklists(*),
        inspection_photos(*),
        inspection_comments(*)
      `);
    },

    byCompany(companyId: string) {
      return this.base().eq("company_id", companyId).is("deleted_at", null);
    },

    byId(id: string) {
      return this.withRelations().eq("id", id).is("deleted_at", null).single();
    },
  },

  checklist: {
    byInspection(inspectionId: string) {
      return db
        .from("inspection_checklists")
        .select("*")
        .eq("inspection_id", inspectionId)
        .is("deleted_at", null)
        .order("category", { ascending: true });
    },
  },

  photos: {
    byInspection(inspectionId: string) {
      return db
        .from("inspection_photos")
        .select("*")
        .eq("inspection_id", inspectionId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });
    },
  },

  financial: {
    byCompany(companyId: string) {
      return db
        .from("financial_entries")
        .select("*")
        .eq("company_id", companyId)
        .is("deleted_at", null)
        .order("entry_date", { ascending: false });
    },

    async summary(companyId: string, startDate: string, endDate: string) {
      return db.rpc("get_financial_summary", {
        p_company_id: companyId,
        p_start_date: startDate,
        p_end_date: endDate,
      });
    },
  },

  dashboard: {
    async stats(companyId: string) {
      return db.rpc("get_dashboard_stats", { p_company_id: companyId });
    },

    async monthly(companyId: string, year?: number) {
      return db.rpc("get_monthly_inspections", {
        p_company_id: companyId,
        p_year: year ?? new Date().getFullYear(),
      });
    },

    async byBrand(companyId: string) {
      return db.rpc("get_inspections_by_brand", { p_company_id: companyId });
    },
  },

  profiles: {
    team(companyId: string) {
      return db
        .from("profiles")
        .select("id, company_id, full_name, role, avatar_url, email, is_active, must_change_password, created_at")
        .eq("company_id", companyId)
        .is("deleted_at", null)
        .order("full_name");
    },

    byId(id: string) {
      return db
        .from("profiles")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .single();
    },
  },

  companies: {
    byId(id: string) {
      return db.from("companies").select("*").eq("id", id).is("deleted_at", null).single();
    },

    settings(companyId: string) {
      return db
        .from("settings")
        .select("*")
        .eq("company_id", companyId)
        .is("deleted_at", null)
        .maybeSingle();
    },
  },
};
