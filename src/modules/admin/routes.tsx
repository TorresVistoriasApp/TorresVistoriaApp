import { Navigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { lazyRoute } from "@/routes/lazy-route";
import type { ModuleRoutes } from "@/routes/route-contract";

export const adminRoutes: ModuleRoutes = {
  client: [
    {
      path: ROUTES.settings,
      element: lazyRoute(() => import("@/modules/admin/settings/pages/settings-page"), "SettingsPage"),
    },
    {
      path: ROUTES.settingsCompany,
      element: lazyRoute(
        () => import("@/modules/admin/settings/pages/company-settings-page"),
        "CompanySettingsPage",
      ),
    },
    {
      path: ROUTES.settingsProfile,
      element: lazyRoute(
        () => import("@/modules/admin/settings/pages/profile-settings-page"),
        "ProfileSettingsPage",
      ),
    },
    {
      path: ROUTES.users,
      element: lazyRoute(() => import("@/modules/admin/users/pages/users-page"), "UsersPage"),
    },
    {
      path: ROUTES.audit,
      element: lazyRoute(() => import("@/modules/admin/audit/pages/audit-page"), "AuditPage"),
    },
    // Endereços antigos preservados para não invalidar links já compartilhados.
    { path: ROUTES.legacySettingsUsers, element: <Navigate to={ROUTES.users} replace /> },
    { path: ROUTES.legacySettingsAudit, element: <Navigate to={ROUTES.audit} replace /> },
  ],
  platform: [
    {
      path: ROUTES.adminCompanies,
      element: lazyRoute(
        () => import("@/modules/admin/platform/pages/admin-companies-page"),
        "AdminCompaniesPage",
      ),
    },
  ],
};
