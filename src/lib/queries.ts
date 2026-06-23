import { supabase } from "./supabase";

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
      return supabase.from("inspections").select(`
        id, inspection_number, inspection_date, inspection_time, location,
        client_name, client_document, client_phone, client_email,
        plate, chassis, renavam, brand, model, version, color,
        fuel, manufacture_year, model_year, mileage,
        situation, opinion, status, technical_notes, internal_notes,
        company_id, inspector_id, created_at, updated_at,
        inspector:profiles!inspections_inspector_id_fkey(id, full_name, avatar_url)
      `);
    },

    withRelations() {
      return supabase.from("inspections").select(`
        *,
        inspector:profiles!inspections_inspector_id_fkey(id, full_name, avatar_url),
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
      return supabase
        .from("inspection_checklists")
        .select("*")
        .eq("inspection_id", inspectionId)
        .is("deleted_at", null)
        .order("category", { ascending: true });
    },
  },

  photos: {
    byInspection(inspectionId: string) {
      return supabase
        .from("inspection_photos")
        .select("*")
        .eq("inspection_id", inspectionId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });
    },
  },

  financial: {
    byCompany(companyId: string) {
      return supabase
        .from("financial_entries")
        .select("*")
        .eq("company_id", companyId)
        .is("deleted_at", null)
        .order("entry_date", { ascending: false });
    },

    async summary(companyId: string, startDate: string, endDate: string) {
      return supabase.rpc("get_financial_summary", {
        p_company_id: companyId,
        p_start_date: startDate,
        p_end_date: endDate,
      });
    },
  },

  dashboard: {
    async stats(companyId: string) {
      return supabase.rpc("get_dashboard_stats", { p_company_id: companyId });
    },

    async monthly(companyId: string, year?: number) {
      return supabase.rpc("get_monthly_inspections", {
        p_company_id: companyId,
        p_year: year ?? new Date().getFullYear(),
      });
    },

    async byBrand(companyId: string) {
      return supabase.rpc("get_inspections_by_brand", { p_company_id: companyId });
    },
  },

  profiles: {
    team(companyId: string) {
      return supabase
        .from("profiles")
        .select("id, company_id, full_name, role, avatar_url, created_at")
        .eq("company_id", companyId)
        .is("deleted_at", null)
        .order("full_name");
    },

    byId(id: string) {
      return supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .single();
    },
  },

  companies: {
    byId(id: string) {
      return supabase.from("companies").select("*").eq("id", id).is("deleted_at", null).single();
    },

    settings(companyId: string) {
      return supabase
        .from("settings")
        .select("*")
        .eq("company_id", companyId)
        .is("deleted_at", null)
        .maybeSingle();
    },
  },
};
