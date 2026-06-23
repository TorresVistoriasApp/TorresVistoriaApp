import { lazy, Suspense, type ComponentType } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/app/protected-route";
import { AuthLayout } from "@/app/(auth)/layout";
import { DashboardLayout } from "@/app/(dashboard)/layout";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

function lazyPage(loader: () => Promise<{ Page: ComponentType }>) {
  const Lazy = lazy(async () => {
    const { Page } = await loader();
    return { default: Page };
  });

  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      }
    >
      <Lazy />
    </Suspense>
  );
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={lazyPage(() => import("@/app/(auth)/login/page"))} />
          <Route path="/recuperar-senha" element={lazyPage(() => import("@/app/(auth)/recuperar-senha/page"))} />
          <Route path="/redefinir-senha" element={lazyPage(() => import("@/app/(auth)/redefinir-senha/page"))} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={lazyPage(() => import("@/app/(dashboard)/page"))} />
            <Route path="/vistorias" element={lazyPage(() => import("@/app/(dashboard)/vistorias/page"))} />
            <Route path="/vistorias/nova" element={lazyPage(() => import("@/app/(dashboard)/vistorias/nova/page"))} />
            <Route path="/vistorias/:id" element={lazyPage(() => import("@/app/(dashboard)/vistorias/[id]/page"))} />
            <Route path="/vistorias/:id/editar" element={lazyPage(() => import("@/app/(dashboard)/vistorias/[id]/editar/page"))} />
            <Route path="/vistorias/:id/fotos" element={lazyPage(() => import("@/app/(dashboard)/vistorias/[id]/fotos/page"))} />
            <Route path="/vistorias/:id/checklist" element={lazyPage(() => import("@/app/(dashboard)/vistorias/[id]/checklist/page"))} />
            <Route path="/vistorias/:id/laudo" element={lazyPage(() => import("@/app/(dashboard)/vistorias/[id]/laudo/page"))} />
            <Route path="/financeiro" element={lazyPage(() => import("@/app/(dashboard)/financeiro/page"))} />
            <Route path="/financeiro/receitas" element={lazyPage(() => import("@/app/(dashboard)/financeiro/receitas/page"))} />
            <Route path="/financeiro/despesas" element={lazyPage(() => import("@/app/(dashboard)/financeiro/despesas/page"))} />
            <Route path="/relatorios" element={lazyPage(() => import("@/app/(dashboard)/relatorios/page"))} />
            <Route path="/configuracoes" element={lazyPage(() => import("@/app/(dashboard)/configuracoes/page"))} />
            <Route path="/configuracoes/empresa" element={lazyPage(() => import("@/app/(dashboard)/configuracoes/empresa/page"))} />
            <Route path="/configuracoes/perfil" element={lazyPage(() => import("@/app/(dashboard)/configuracoes/perfil/page"))} />
            <Route path="/configuracoes/usuarios" element={lazyPage(() => import("@/app/(dashboard)/configuracoes/usuarios/page"))} />
            <Route path="/configuracoes/auditoria" element={lazyPage(() => import("@/app/(dashboard)/configuracoes/auditoria/page"))} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
