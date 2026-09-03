export type MigrationHealthReport = {
  tenantId: string | null;
  generatedAt: string;
  orphanAuditLogs: number;
  inspectionsMissingCreatedBy: number;
  photosNonCanonicalPath: number;
  reportsNonCanonicalPath: number;
  pendingStorageMigrations: number;
  completedStorageMigrations: number;
  profilesWithoutCompany: number;
  isHealthy: boolean;
};

/** Verifica se um path de foto segue o layout canônico multi-tenant. */
export function isCanonicalInspectionPhotoPath(
  storagePath: string,
  tenantId: string,
  inspectionId: string,
): boolean {
  const parts = storagePath.split("/").filter(Boolean);
  if (parts.length < 3) return false;
  if (parts[0] !== tenantId || parts[1] !== inspectionId) return false;
  if (!storagePath.endsWith(".webp")) return false;
  if (parts.includes("thumbs")) return parts[parts.length - 2] === "thumbs";
  return true;
}

/** Verifica se um path de laudo segue o layout canônico. pending/ não é mais válido. */
export function isCanonicalReportPath(
  storagePath: string,
  tenantId: string,
  inspectionId: string,
): boolean {
  if (storagePath.startsWith("pending/")) return false;
  const parts = storagePath.split("/").filter(Boolean);
  return (
    parts.length === 3 &&
    parts[0] === tenantId &&
    parts[1] === inspectionId &&
    storagePath.endsWith(".pdf")
  );
}
