import { lazy, Suspense, type ComponentType } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "@/app/layout";
import { AuthLayout } from "@/app/(auth)/layout";
import { PublicLayout } from "@/app/(public)/layout";
import { DashboardLayout } from "@/app/(dashboard)/layout";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

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
        path: "/dashboard",
        element: <Navigate to="/" replace />,
      },
      {
        element: <PublicLayout />,
        children: [
          {
            path: "/privacidade",
            element: lazyPage(() => import("@/app/(public)/privacidade/page")),
          },
          {
            path: "/validar/:codigo",
            element: lazyPage(() => import("@/app/(public)/validar/[codigo]/page")),
          },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: lazyPage(() => import("@/app/(auth)/login/page")) },
          {
            path: "/recuperar-senha",
            element: lazyPage(() => import("@/app/(auth)/recuperar-senha/page")),
          },
          {
            path: "/redefinir-senha",
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
                path: "/vistorias",
                element: lazyPage(() => import("@/app/(dashboard)/vistorias/page")),
              },
              {
                path: "/vistorias/nova",
                element: lazyPage(() => import("@/app/(dashboard)/vistorias/nova/page")),
              },
              {
                path: "/vistorias/:id",
                element: lazyPage(() => import("@/app/(dashboard)/vistorias/[id]/page")),
              },
              {
                path: "/vistorias/:id/editar",
                element: lazyPage(() => import("@/app/(dashboard)/vistorias/[id]/editar/page")),
              },
              {
                path: "/vistorias/:id/fotos",
                element: lazyPage(() => import("@/app/(dashboard)/vistorias/[id]/fotos/page")),
              },
              {
                path: "/vistorias/:id/checklist",
                element: lazyPage(() => import("@/app/(dashboard)/vistorias/[id]/checklist/page")),
              },
              {
                path: "/vistorias/:id/laudo",
                element: lazyPage(() => import("@/app/(dashboard)/vistorias/[id]/laudo/page")),
              },
              {
                path: "/financeiro",
                element: lazyPage(() => import("@/app/(dashboard)/financeiro/page")),
              },
              {
                path: "/financeiro/receitas",
                element: lazyPage(() => import("@/app/(dashboard)/financeiro/receitas/page")),
              },
              {
                path: "/financeiro/despesas",
                element: lazyPage(() => import("@/app/(dashboard)/financeiro/despesas/page")),
              },
              {
                path: "/relatorios",
                element: lazyPage(() => import("@/app/(dashboard)/relatorios/page")),
              },
              {
                path: "/configuracoes",
                element: lazyPage(() => import("@/app/(dashboard)/configuracoes/page")),
              },
              {
                path: "/configuracoes/empresa",
                element: lazyPage(() => import("@/app/(dashboard)/configuracoes/empresa/page")),
              },
              {
                path: "/configuracoes/perfil",
                element: lazyPage(() => import("@/app/(dashboard)/configuracoes/perfil/page")),
              },
              {
                path: "/configuracoes/usuarios",
                element: lazyPage(() => import("@/app/(dashboard)/configuracoes/usuarios/page")),
              },
              {
                path: "/configuracoes/auditoria",
                element: lazyPage(() => import("@/app/(dashboard)/configuracoes/auditoria/page")),
              },
            ],
          },
        ],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
