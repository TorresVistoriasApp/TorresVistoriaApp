import { db } from "@/infra/supabase/client";
import type { AuditAppAction } from "@/core/audit/audit-actions";
import type { Json } from "@/infra/supabase/database.types";

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

export type AuditEventInput = {
  action: AuditAppAction;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export const auditService = {
  async list(
    companyId: string | undefined,
    filters: AuditFilters = {},
    limit = 50,
    offset = 0,
  ): Promise<{ logs: AuditLogWithUser[]; total: number }> {
    let query = db
      .from("audit_logs")
      .select(
        `
        id, company_id, user_id, action, entity_type, entity_id,
        old_data, new_data, ip_address, user_agent, created_at,
        user:profiles!audit_logs_user_id_fkey(id, full_name)
      `,
        { count: "exact" },
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    if (filters.action) query = query.eq("action", filters.action);
    if (filters.entityType) query = query.eq("entity_type", filters.entityType);
    if (filters.userId) query = query.eq("user_id", filters.userId);
    if (filters.startDate) query = query.gte("created_at", `${filters.startDate}T00:00:00`);
    if (filters.endDate) query = query.lte("created_at", `${filters.endDate}T23:59:59`);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      logs: (data ?? []).map((row) => ({
        ...(row as AuditLog),
        user: (row as { user: AuditLogWithUser["user"] }).user ?? null,
      })),
      total: count ?? 0,
    };
  },

  async recordEvent(input: AuditEventInput): Promise<string | null> {
    const { data, error } = await db.rpc("record_audit_event", {
      p_action: input.action,
      p_entity_type: input.entityType ?? "app",
      p_entity_id: input.entityId ?? undefined,
      p_metadata: (input.metadata ?? {}) as Json,
    });

    if (error) throw error;
    return data as string | null;
  },
};
