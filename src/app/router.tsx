import { lazy, Suspense, type ComponentType } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "@/app/layout";
import { AuthLayout } from "@/app/(auth)/layout";
import { PublicLayout } from "@/app/(public)/layout";
import { DashboardLayout } from "@/app/(dashboard)/layout";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ROUTE_PATTERNS, ROUTES } from "@/lib/constants";

function lazyPage(loader: () => Promise<{ Page: ComponentType }>) {
  const Lazy = lazy(async () => {
    const { Page } = await loader();
    return { default: Page };
  });

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <Lazy />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: ROUTES.legacyDashboard,
        element: <Navigate to={ROUTES.dashboard} replace />,
      },
      {
        element: <PublicLayout />,
        children: [
          {
            path: ROUTES.privacy,
            element: lazyPage(() => import("@/app/(public)/privacidade/page")),
          },
          {
            path: ROUTE_PATTERNS.validateReport,
            element: lazyPage(() => import("@/app/(public)/validar/[codigo]/page")),
          },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.login, element: lazyPage(() => import("@/app/(auth)/login/page")) },
          {
            path: ROUTES.forgotPassword,
            element: lazyPage(() => import("@/app/(auth)/recuperar-senha/page")),
          },
          {
            path: ROUTES.resetPassword,
            element: lazyPage(() => import("@/app/(auth)/redefinir-senha/page")),
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { index: true, element: lazyPage(() => import("@/app/(dashboard)/page")) },
              {
                path: ROUTES.inspections,
                element: lazyPage(() => import("@/app/(dashboard)/vistorias/page")),
              },
              {
                path: ROUTES.inspectionNew,
                element: lazyPage(() => import("@/app/(dashboard)/vistorias/nova/page")),
              },
              {
                path: ROUTE_PATTERNS.inspection,
                element: lazyPage(() => import("@/app/(dashboard)/vistorias/[id]/page")),
              },
              {
                path: ROUTE_PATTERNS.inspectionEdit,
                element: lazyPage(() => import("@/app/(dashboard)/vistorias/[id]/editar/page")),
              },
              {
                path: ROUTE_PATTERNS.inspectionPhotos,
                element: lazyPage(() => import("@/app/(dashboard)/vistorias/[id]/fotos/page")),
              },
              {
                path: ROUTE_PATTERNS.inspectionChecklist,
                element: lazyPage(() => import("@/app/(dashboard)/vistorias/[id]/checklist/page")),
              },
              {
                path: ROUTE_PATTERNS.inspectionReport,
                element: lazyPage(() => import("@/app/(dashboard)/vistorias/[id]/laudo/page")),
              },
              {
                path: ROUTES.financial,
                element: lazyPage(() => import("@/app/(dashboard)/financeiro/page")),
              },
              {
                path: ROUTES.financialRevenue,
                element: lazyPage(() => import("@/app/(dashboard)/financeiro/receitas/page")),
              },
              {
                path: ROUTES.financialExpenses,
                element: lazyPage(() => import("@/app/(dashboard)/financeiro/despesas/page")),
              },
              {
                path: ROUTES.reports,
                element: lazyPage(() => import("@/app/(dashboard)/relatorios/page")),
              },
              {
                path: ROUTES.settings,
                element: lazyPage(() => import("@/app/(dashboard)/configuracoes/page")),
              },
              {
                path: ROUTES.settingsCompany,
                element: lazyPage(() => import("@/app/(dashboard)/configuracoes/empresa/page")),
              },
              {
                path: ROUTES.settingsProfile,
                element: lazyPage(() => import("@/app/(dashboard)/configuracoes/perfil/page")),
              },
              {
                path: ROUTES.settingsUsers,
                element: lazyPage(() => import("@/app/(dashboard)/configuracoes/usuarios/page")),
              },
              {
                path: ROUTES.settingsAudit,
                element: lazyPage(() => import("@/app/(dashboard)/configuracoes/auditoria/page")),
              },
            ],
          },
        ],
      },
      { path: "*", element: <Navigate to={ROUTES.dashboard} replace /> },
    ],
  },
]);
