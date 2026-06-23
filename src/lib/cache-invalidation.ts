import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";

export function invalidateInspectionQueries(qc: QueryClient, id?: string) {
  void qc.invalidateQueries({ queryKey: queryKeys.inspections.all });
  if (id) {
    void qc.invalidateQueries({ queryKey: queryKeys.inspections.detail(id) });
    void qc.invalidateQueries({ queryKey: queryKeys.checklist(id) });
    void qc.invalidateQueries({ queryKey: queryKeys.photos(id) });
  }
}

export function invalidateFinancialQueries(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: queryKeys.financial.all });
  void qc.invalidateQueries({ queryKey: ["financial", "summary"] });
  void qc.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
}

export function invalidateDashboardQueries(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
  void qc.invalidateQueries({ queryKey: queryKeys.dashboard.recent });
  void qc.invalidateQueries({ queryKey: ["dashboard", "monthly"] });
  void qc.invalidateQueries({ queryKey: queryKeys.dashboard.brands });
}

export function invalidateUserQueries(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: queryKeys.profile });
  void qc.invalidateQueries({ queryKey: queryKeys.users.team });
}

export function invalidateCompanyQueries(qc: QueryClient, companyId?: string) {
  if (companyId) {
    void qc.invalidateQueries({ queryKey: queryKeys.company.detail(companyId) });
    void qc.invalidateQueries({ queryKey: queryKeys.company.settings(companyId) });
  }
}
