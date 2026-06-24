import { db } from "@/lib/db-client";

export type AppNotification = {
  id: string;
  company_id: string;
  user_id: string;
  title: string;
  body: string;
  read_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    const { data, error } = await db
      .from("notifications")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as AppNotification[];
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await db
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async markAllAsRead(): Promise<void> {
    const { error } = await db
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);
    if (error) throw error;
  },

  unreadCount(notifications: AppNotification[]): number {
    return notifications.filter((n) => !n.read_at).length;
  },
};
