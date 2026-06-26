import { mutations } from "@/lib/mutations";
import { getErrorMessage } from "@/lib/errors";

/** Campos mínimos compatíveis com o schema original de inspection_photos. */
export type LegacyPhotoInsertRow = {
  company_id: string;
  inspection_id: string;
  category: string;
  storage_path: string;
  public_url: string;
  file_size: number;
  mime_type: string;
  latitude?: number | null;
  longitude?: number | null;
};

/** Campos estendidos — requer migration 20250626140000_photo_module_refactor. */
export type ExtendedPhotoInsertRow = LegacyPhotoInsertRow & {
  section_key?: string | null;
  subcategory?: string | null;
  display_name?: string | null;
  sort_order?: number | null;
  is_required?: boolean | null;
  thumbnail_url?: string | null;
  content_hash?: string | null;
  width?: number | null;
  height?: number | null;
  resolution?: string | null;
  gps_accuracy?: number | null;
  captured_at?: string | null;
  device_model?: string | null;
  device_os?: string | null;
  uploaded_by?: string | null;
  status?: string | null;
  damage_location?: string | null;
  damage_category?: string | null;
  damage_severity?: string | null;
  complementary_name?: string | null;
  complementary_category?: string | null;
  ai_validation?: Record<string, unknown> | null;
};

export function toLegacyPhotoInsert(row: ExtendedPhotoInsertRow): LegacyPhotoInsertRow {
  return {
    company_id: row.company_id,
    inspection_id: row.inspection_id,
    category: row.category,
    storage_path: row.storage_path,
    public_url: row.public_url,
    file_size: row.file_size,
    mime_type: row.mime_type,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
  };
}

export function isMissingColumnSchemaError(error: unknown): boolean {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: unknown }).code);
    if (code === "PGRST204" || code === "42703") return true;
  }

  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes("schema cache") ||
    message.includes("could not find") ||
    (message.includes("column") && message.includes("inspection_photos"))
  );
}

/**
 * Insere foto tentando metadados estendidos; faz fallback para schema legado
 * quando a migration ainda não foi aplicada no Supabase.
 */
export async function insertInspectionPhoto(row: ExtendedPhotoInsertRow) {
  const extended = await mutations.photos.create(row);
  if (!extended.error) return extended;

  if (!isMissingColumnSchemaError(extended.error)) return extended;

  return mutations.photos.create(toLegacyPhotoInsert(row));
}
