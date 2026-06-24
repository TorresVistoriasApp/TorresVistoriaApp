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
  created_at: string;
};

export const auditService = {
  async list(limit = 100): Promise<AuditLog[]> {
    const { data, error } = await db
      .from("audit_logs")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as AuditLog[];
  },
};
