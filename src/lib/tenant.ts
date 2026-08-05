/** Garante company_id da sessão antes de consultas/mutations tenant-scoped. */
export function requireCompanyId(companyId: string | null | undefined): string {
  if (!companyId) {
    throw new Error("Sessão inválida: empresa não carregada");
  }
  return companyId;
}

/** Garante userId da sessão antes de mutations tenant-scoped. */
export function requireUserId(userId: string | null | undefined): string {
  if (!userId) {
    throw new Error("Sessão inválida: usuário não autenticado");
  }
  return userId;
}
