import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/infra/supabase/queries";

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

export function invalidateCompanyQueries(qc: QueryClient, tenantId?: string) {
  if (tenantId) {
    void qc.invalidateQueries({ queryKey: queryKeys.company.detail(tenantId) });
    void qc.invalidateQueries({ queryKey: queryKeys.company.settings(tenantId) });
  }
}
