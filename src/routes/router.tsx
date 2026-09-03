import { createBrowserRouter, Navigate, Outlet, type RouteObject } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { RootLayout } from "@/layouts/root-layout";
import { AuthLayout } from "@/layouts/auth-layout";
import { PublicLayout } from "@/layouts/public-layout";
import { ClientLayout } from "@/layouts/client-layout";
import { AdminLayout } from "@/layouts/admin-layout";
import { ProtectedRoute } from "@/routes/guards/protected-route";
import { ConsumerProtectedRoute } from "@/routes/guards/consumer-protected-route";
import { ConsumerInactiveAccountRoute } from "@/routes/guards/consumer-inactive-account-route";
import { PlatformAdminRoute } from "@/routes/guards/platform-admin-route";
import { RequirePasswordChanged } from "@/routes/guards/require-password-changed";
import { RequirePrivilegedMfa } from "@/routes/guards/require-privileged-mfa";
import { TenantGuard } from "@/core/tenant/tenant-guard";
import type { ModuleRoutes } from "@/routes/route-contract";
import { authRoutes } from "@/core/auth/routes";
import { complianceRoutes } from "@/core/compliance/routes";
import { torresVistoriaRoutes } from "@/modules/torres-vistoria/routes";
import { torresConsultaRoutes } from "@/modules/torres-consulta/routes";
import { adminRoutes } from "@/modules/admin/routes";
import { PanelRedirect } from "@/routes/panel-redirect";

const MODULES: ModuleRoutes[] = [
  authRoutes,
  complianceRoutes,
  torresVistoriaRoutes,
  torresConsultaRoutes,
  adminRoutes,
];

const collect = (area: keyof ModuleRoutes): RouteObject[] =>
  MODULES.flatMap((module) => module[area] ?? []);

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: ROUTES.vistoriaLogin, element: <Navigate to={ROUTES.login} replace /> },

      // Marketing / landing B2C — layout próprio por página.
      { element: <Outlet />, children: collect("marketing") },

      // Área pública — sem sessão.
      { element: <PublicLayout />, children: collect("public") },

      // Área de autenticação — sem sessão, shell mínimo.
      { element: <AuthLayout />, children: collect("auth") },

      // Área administrativa da plataforma — operador do SaaS.
      {
        element: <PlatformAdminRoute />,
        children: [
          {
            element: <RequirePrivilegedMfa />,
            children: [{ element: <AdminLayout />, children: collect("platform") }],
          },
        ],
      },

      // Área autenticada do consumidor (B2C) — sem tenant.
      {
        element: <ConsumerProtectedRoute />,
        children: [
          {
            element: <ConsumerInactiveAccountRoute />,
            children: collect("consumer"),
          },
        ],
      },

      // Área autenticada do tenant.
      //
      // `standalone` fica fora do TenantGuard de propósito: trocar senha precisa
      // funcionar mesmo quando a empresa não carregou, senão o usuário fica preso.
      {
        element: <ProtectedRoute />,
        children: [
          ...collect("standalone"),
          {
            element: <RequirePasswordChanged />,
            children: [
              {
                element: <RequirePrivilegedMfa />,
                children: [
                  {
                    element: <TenantGuard />,
                    children: [{ element: <ClientLayout />, children: collect("client") }],
                  },
                ],
              },
            ],
          },
        ],
      },

      { path: "*", element: <PanelRedirect /> },
    ],
  },
]);
