export type SyncStatus = "synced" | "pending" | "saving" | "offline";

export type ActiveDraftSummary = {
  id: string;
  client_name: string;
  plate: string;
  completion_percent: number;
  created_at: string;
  updated_at: string;
  draft_expires_at: string | null;
  last_auto_saved_at: string | null;
  inspection_number: number;
};
