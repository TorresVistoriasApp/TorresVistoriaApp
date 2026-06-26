import { db } from "@/lib/db-client";

export type AuditLog = {
  id: string;
  company_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type AuditLogWithUser = AuditLog & {
  user: { id: string; full_name: string } | null;
};

export type AuditFilters = {
  action?: string;
  entityType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
};

export const auditService = {
  async list(filters: AuditFilters = {}, limit = 1000): Promise<AuditLogWithUser[]> {
    let query = db
      .from("audit_logs")
      .select(`
        id, company_id, user_id, action, entity_type, entity_id,
        old_data, new_data, ip_address, user_agent, created_at,
        user:profiles!audit_logs_user_id_fkey(id, full_name)
      `)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (filters.action) query = query.eq("action", filters.action);
    if (filters.entityType) query = query.eq("entity_type", filters.entityType);
    if (filters.userId) query = query.eq("user_id", filters.userId);
    if (filters.startDate) query = query.gte("created_at", `${filters.startDate}T00:00:00`);
    if (filters.endDate) query = query.lte("created_at", `${filters.endDate}T23:59:59`);

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map((row) => ({
      ...(row as AuditLog),
      user: (row as { user: AuditLogWithUser["user"] }).user ?? null,
    }));
  },
};
