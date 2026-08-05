/** Garante tenant_id da sessão antes de consultas/mutations tenant-scoped. */
export function requireTenantId(tenantId: string | null | undefined): string {
  if (!tenantId) {
    throw new Error("Sessão inválida: empresa não carregada");
  }
  return tenantId;
}

/** Garante userId da sessão antes de mutations tenant-scoped. */
export function requireUserId(userId: string | null | undefined): string {
  if (!userId) {
    throw new Error("Sessão inválida: usuário não autenticado");
  }
  return userId;
}
