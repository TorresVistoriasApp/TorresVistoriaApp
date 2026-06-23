import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { AppLayout } from "@/shared/components/layout/app-layout";
import { LoginPage } from "@/features/auth/pages/login-page";
import { ForgotPasswordPage } from "@/features/auth/pages/forgot-password-page";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { InspectionsListPage } from "@/features/inspections/pages/inspections-list-page";
import { InspectionFormPage } from "@/features/inspections/pages/inspection-form-page";
import { FinancialPage } from "@/features/financial/pages/financial-page";
import { ReportsPage } from "@/features/reports/pages/reports-page";
import { SettingsPage } from "@/features/settings/pages/settings-page";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vistorias" element={<InspectionsListPage />} />
            <Route path="/vistorias/nova" element={<InspectionFormPage />} />
            <Route path="/vistorias/:id" element={<InspectionFormPage />} />
            <Route path="/financeiro" element={<FinancialPage />} />
            <Route path="/relatorios" element={<ReportsPage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
