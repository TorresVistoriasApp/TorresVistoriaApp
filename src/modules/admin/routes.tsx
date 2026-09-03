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
      element: lazyRoute(
        () => import("@/modules/admin/users/pages/users-page"),
        "UsersPage",
        { permission: "users.manage" },
      ),
    },
    {
      path: ROUTES.usersPendingRegistrations,
      element: lazyRoute(
        () => import("@/modules/admin/users/pages/inspector-registrations-page"),
        "InspectorRegistrationsPage",
        { permission: "users.manage" },
      ),
    },
    {
      path: ROUTES.audit,
      element: lazyRoute(
        () => import("@/modules/admin/audit/pages/audit-page"),
        "AuditPage",
        { permission: "users.manage" },
      ),
    },
    // Endereços antigos preservados para não invalidar links já compartilhados.
    { path: ROUTES.legacySettingsUsers, element: <Navigate to={ROUTES.users} replace /> },
    { path: ROUTES.legacySettingsAudit, element: <Navigate to={ROUTES.audit} replace /> },
  ],
  platform: [
    { path: ROUTES.admin, element: <Navigate to={ROUTES.adminCompanies} replace /> },
    {
      path: ROUTES.adminCompanies,
      element: lazyRoute(
        () => import("@/modules/admin/platform/pages/admin-companies-page"),
        "AdminCompaniesPage",
      ),
    },
    {
      path: ROUTES.adminInspectorRegistrations,
      element: lazyRoute(
        () => import("@/modules/admin/platform/pages/admin-inspector-registrations-page"),
        "AdminInspectorRegistrationsPage",
      ),
    },
  ],
};
