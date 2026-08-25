import { Outlet } from "react-router-dom";
import { TenantAuthHeader } from "@/core/auth/layouts/tenant-auth-header";
import { TenantAuthShowcase } from "@/core/auth/components/tenant-auth-showcase";

function AuthBrandIntro() {
  return (
    <>
      <p className="ui-eyebrow">Área do vistoriador</p>
      <h1 className="mt-2 text-balance text-[1.75rem] font-bold leading-[1.12] text-foreground sm:text-[2rem] lg:text-[2.125rem]">
        Precisão em cada <span className="text-primary">laudo cautelar</span>
      </h1>
      <p className="mt-2 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
        Ambiente exclusivo para profissionais: evidências fotográficas, checklist técnico e emissão
        de laudos com rastreabilidade.
      </p>
    </>
  );
}

export function TenantAuthLayout() {
  return (
    <div className="consulta-page flex min-h-dvh flex-col">
      <TenantAuthHeader />

      <main className="landing-hero-bg relative flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="grid w-full items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,24.5rem)] lg:gap-x-10">
            <div className="lg:col-span-2">
              <AuthBrandIntro />
            </div>

            <div className="hidden lg:col-start-1 lg:row-start-2 lg:block">
              <TenantAuthShowcase />
            </div>

            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
