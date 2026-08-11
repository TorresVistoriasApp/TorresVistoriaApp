import type { QueryClient } from "@tanstack/react-query";
import { cacheKeys } from "@/core/cache/cache-keys";
import { createCacheService } from "@/core/cache/cache-service";
import { queryKeys } from "@/infra/supabase/queries";

/**
 * Invalidadores de domínio.
 *
 * Preferem as chaves canônicas de `core/cache` quando o dado já migrou; as
 * chaves legadas de `queryKeys` ainda existem porque Vistoria não foi reescrita.
 */

export function invalidateInspectionQueries(qc: QueryClient, id?: string) {
  if (id) {
    void qc.invalidateQueries({ queryKey: queryKeys.inspections.detail(id) });
    void qc.invalidateQueries({ queryKey: queryKeys.checklist(id) });
    void qc.invalidateQueries({ queryKey: queryKeys.photos(id) });
    return;
  }
  void qc.invalidateQueries({ queryKey: queryKeys.inspections.all });
}

export function invalidateFinancialQueries(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: queryKeys.financial.all });
  void qc.invalidateQueries({ queryKey: ["financial", "summary"] });
  void qc.invalidateQueries({ queryKey: ["dashboard", "metrics"] });
}

export function invalidateDashboardQueries(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: ["dashboard", "metrics"] });
  void qc.invalidateQueries({ queryKey: ["dashboard", "recent"] });
  void qc.invalidateQueries({ queryKey: ["dashboard", "monthly"] });
  void qc.invalidateQueries({ queryKey: ["dashboard", "brands"] });
}

export function invalidateUserQueries(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: queryKeys.profile });
  void qc.invalidateQueries({ queryKey: ["users", "team"] });
}

export function invalidateTenantQueries(qc: QueryClient, tenantId?: string) {
  if (!tenantId) return;
  const cache = createCacheService(qc);
  void cache.invalidate(cacheKeys.tenant.company(tenantId));
  void cache.invalidate(cacheKeys.tenant.settings(tenantId));
  // Chaves legadas ainda usadas por company-service / use-tenant.
  void qc.invalidateQueries({ queryKey: queryKeys.company.detail(tenantId) });
  void qc.invalidateQueries({ queryKey: queryKeys.company.settings(tenantId) });
}

/** @deprecated Use `invalidateTenantQueries`. */
export const invalidateCompanyQueries = invalidateTenantQueries;

export function invalidateConsultaQueries(qc: QueryClient, tenantId: string, id?: string) {
  const cache = createCacheService(qc);
  if (id) {
    void cache.invalidate(cacheKeys.consulta.detail(tenantId, id));
  }
  void cache.invalidate(cacheKeys.consulta.all(tenantId));
  void cache.invalidate(cacheKeys.consulta.credits(tenantId));
}

export function invalidateConsumerConsultaQueries(qc: QueryClient, consumerId: string, id?: string) {
  const cache = createCacheService(qc);
  if (id) {
    void cache.invalidate(cacheKeys.consumer.consultaDetail(consumerId, id));
  }
  void cache.invalidate(cacheKeys.consumer.consultas(consumerId));
  void cache.invalidate(cacheKeys.consumer.credits(consumerId));
  void cache.invalidate(cacheKeys.consumer.dashboard(consumerId));
}
