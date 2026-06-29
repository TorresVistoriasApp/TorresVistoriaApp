/** Prazo de validade de um rascunho de vistoria. */
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

/** Intervalo de salvamento silencioso quando há alterações pendentes. */
export const AUTO_SAVE_INTERVAL_MS = 30_000;

/** Debounce após alteração de campo antes de persistir. */
export const AUTO_SAVE_DEBOUNCE_MS = 800;

export const OFFLINE_DB_NAME = "torres-vistoria-offline";
export const OFFLINE_DB_VERSION = 1;

export const OFFLINE_STORES = {
  inspectionUpdates: "pending_inspection_updates",
  photoUploads: "pending_photo_uploads",
  formSnapshots: "local_form_snapshots",
} as const;

export const ACTIVE_DRAFT_STORAGE_KEY = "torres:active-draft-id";
