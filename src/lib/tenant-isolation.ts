import { UserRole } from "@/lib/enums";

/** Sessão autenticada no tenant (espelha auth.uid + profiles). */
export type TenantSession = {
  userId: string;
  companyId: string;
  role: string;
};

/** Recurso com escopo multi-tenant (espelha colunas company_id + created_by). */
export type TenantResource = {
  companyId: string;
  createdBy: string | null;
};

export type FinancialResource = TenantResource & {
  inspectionId: string | null;
  /** created_by da vistoria vinculada (quando inspection_id presente). */
  inspectionCreatedBy?: string | null;
};

/**
 * Espelha `public.can_access_tenant_row` (RLS Etapa 5).
 * SUPER_ADMIN → toda a empresa; INSPECTOR → apenas created_by = auth.uid().
 */
export function canAccessTenantRow(session: TenantSession, resource: TenantResource): boolean {
  if (resource.companyId !== session.companyId) {
    return false;
  }
  if (session.role === UserRole.SUPER_ADMIN) {
    return true;
  }
  if (session.role === UserRole.INSPECTOR) {
    return resource.createdBy !== null && resource.createdBy === session.userId;
  }
  return false;
}

/**
 * Espelha `public.can_access_financial_row` (RLS Etapa 11).
 * INSPECTOR vê lançamentos próprios ou de vistorias que criou.
 */
export function canAccessFinancialRow(
  session: TenantSession,
  resource: FinancialResource,
): boolean {
  if (resource.companyId !== session.companyId) {
    return false;
  }
  if (session.role === UserRole.SUPER_ADMIN) {
    return true;
  }
  if (session.role === UserRole.INSPECTOR) {
    if (resource.createdBy === session.userId) {
      return true;
    }
    if (resource.inspectionId && resource.inspectionCreatedBy === session.userId) {
      return true;
    }
    return false;
  }
  return false;
}

/** Auditoria: somente SUPER_ADMIN da mesma empresa (users.manage + RLS). */
export function canAccessAuditLog(session: TenantSession, logCompanyId: string | null): boolean {
  if (session.role !== UserRole.SUPER_ADMIN) {
    return false;
  }
  if (!logCompanyId) {
    return false;
  }
  return logCompanyId === session.companyId;
}

const UUID_PREFIX_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Extrai company_id do primeiro segmento de um path canônico de Storage. */
export function storagePathCompanyId(storagePath: string): string | null {
  const first = storagePath.split("/").filter(Boolean)[0];
  if (!first || !UUID_PREFIX_RE.test(first)) {
    return null;
  }
  return first;
}

export function storagePathBelongsToCompany(storagePath: string, companyId: string): boolean {
  return storagePathCompanyId(storagePath) === companyId;
}

/** Retorna true quando o path aponta para outro tenant. */
export function isCrossTenantStoragePath(storagePath: string, expectedCompanyId: string): boolean {
  const pathCompanyId = storagePathCompanyId(storagePath);
  return pathCompanyId !== null && pathCompanyId !== expectedCompanyId;
}

/** Filtra perfis visíveis: mesma empresa; inspector só enxerga a si. */
export function filterVisibleProfiles<T extends { id: string; companyId: string }>(
  session: TenantSession,
  profiles: T[],
): T[] {
  return profiles.filter((profile) => {
    if (profile.companyId !== session.companyId) {
      return false;
    }
    if (session.role === UserRole.SUPER_ADMIN) {
      return true;
    }
    if (session.role === UserRole.INSPECTOR) {
      return profile.id === session.userId;
    }
    return false;
  });
}
