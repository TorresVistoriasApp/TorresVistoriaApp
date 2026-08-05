import { db } from "@/infra/supabase/client";

export const queryKeys = {
  inspections: {
    all: ["inspections"] as const,
    list: (tenantId: string | undefined, filters?: Record<string, unknown>) =>
      ["inspections", "list", tenantId, filters] as const,
    detail: (id: string) => ["inspections", id] as const,
    search: (tenantId: string | undefined, params?: Record<string, unknown>) =>
      ["inspections", "search", tenantId, params] as const,
  },
  checklist: (inspectionId: string) => ["checklist", inspectionId] as const,
  photos: (inspectionId: string) => ["photos", inspectionId] as const,
  dashboard: {
    metrics: (tenantId?: string) => ["dashboard", "metrics", tenantId] as const,
    recent: (tenantId?: string) => ["dashboard", "recent", tenantId] as const,
    monthly: (tenantId?: string, year?: number) =>
      ["dashboard", "monthly", tenantId, year] as const,
    brands: (tenantId?: string) => ["dashboard", "brands", tenantId] as const,
  },
  financial: {
    all: ["financial"] as const,
    list: (tenantId: string | undefined, page: number, pageSize: number) =>
      ["financial", "list", tenantId, page, pageSize] as const,
    summary: (tenantId: string | undefined, startDate?: string, endDate?: string) =>
      ["financial", "summary", tenantId, startDate, endDate] as const,
  },
  profile: ["profile"] as const,
  company: {
    detail: (id: string) => ["company", id] as const,
    settings: (id: string) => ["company", id, "settings"] as const,
  },
  inspectionTypes: {
    all: ["inspection-types"] as const,
    list: (tenantId?: string, activeOnly?: boolean) =>
      ["inspection-types", tenantId, activeOnly] as const,
  },
  users: {
    team: (tenantId?: string) => ["users", "team", tenantId] as const,
  },
  platformCompanies: {
    all: ["platform-companies"] as const,
  },
  audit: {
    all: ["audit"] as const,
    list: (
      tenantId: string | undefined,
      filters?: Record<string, unknown>,
      page?: number,
      pageSize?: number,
    ) => ["audit", "list", tenantId, filters, page, pageSize] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
} as const;

export const queries = {
  inspections: {
    base(options?: { count?: "exact" }) {
      return db.from("inspections").select(
        `
        id, inspection_number, inspection_date, inspection_time, location,
        inspection_purpose, inspection_type_id, requester_name, requester_document,
        buyer_name, buyer_document, seller_name, seller_document,
        judicial_process, judicial_court, judicial_district,
        client_name, client_document, client_phone, client_email,
        plate, chassis, renavam, brand, model, version, color,
        motor_number, vehicle_uf, registration_city_uf, vehicle_category, vehicle_species,
        passenger_capacity, power_cv, engine_displacement,
        fuel, manufacture_year, model_year, mileage,
        market_fipe_value, market_average_value, insurance_acceptance_percent, vehicle_condition, is_armored,
        situation, opinion, status, technical_notes, internal_notes,
        completion_percent, draft_expires_at, last_auto_saved_at,
        tenant_id, inspector_id, created_at, updated_at,
        inspector:profiles!inspections_inspector_id_fkey(id, full_name, avatar_url, role)
      `,
        options?.count ? { count: options.count } : undefined,
      );
    },

    withRelations() {
      return db.from("inspections").select(`
        *,
        inspector:profiles!inspections_inspector_id_fkey(id, full_name, avatar_url, role),
        inspection_comments(*)
      `);
    },

    byCompany(tenantId: string, options?: { count?: "exact" }) {
      return this.base(options).eq("tenant_id", tenantId).is("deleted_at", null);
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
    byCompany(tenantId: string, limit = 50, offset = 0) {
      return db
        .from("financial_entries")
        .select("*", { count: "exact" })
        .eq("tenant_id", tenantId)
        .is("deleted_at", null)
        .order("entry_date", { ascending: false })
        .range(offset, offset + limit - 1);
    },

    async summary(tenantId: string, startDate: string, endDate: string) {
      return db.rpc("get_financial_summary", {
        p_tenant_id: tenantId,
        p_start_date: startDate,
        p_end_date: endDate,
      });
    },
  },

  dashboard: {
    async stats(tenantId: string) {
      return db.rpc("get_dashboard_stats", { p_tenant_id: tenantId });
    },

    async monthly(tenantId: string, year?: number) {
      return db.rpc("get_monthly_inspections", {
        p_tenant_id: tenantId,
        p_year: year ?? new Date().getFullYear(),
      });
    },

    async byBrand(tenantId: string) {
      return db.rpc("get_inspections_by_brand", { p_tenant_id: tenantId });
    },
  },

  profiles: {
    team(tenantId: string) {
      return db
        .from("profiles")
        .select(
          "id, tenant_id, full_name, role, avatar_url, email, phone, is_active, status, must_change_password, created_at",
        )
        .eq("tenant_id", tenantId)
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

    settings(tenantId: string) {
      return db
        .from("settings")
        .select("*")
        .eq("tenant_id", tenantId)
        .is("deleted_at", null)
        .maybeSingle();
    },
  },
};
