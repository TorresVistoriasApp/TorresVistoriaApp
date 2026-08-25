import { Link, Outlet } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { TenantAuthShowcase } from "@/core/auth/components/tenant-auth-showcase";
import { BrandLogo } from "@/shared/components/brand-logo";
import { Button } from "@/shared/ui/button";

function AuthBrandIntro() {
  return (
    <>
      <p className="ui-eyebrow">Área do vistoriador</p>
      <h1 className="mt-3 text-balance text-[1.75rem] font-bold leading-[1.12] text-foreground sm:text-[2rem] lg:text-[2.375rem]">
        Precisão em cada <span className="text-primary">laudo cautelar</span>
      </h1>
      <p className="mt-3.5 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
        Ambiente exclusivo para profissionais: evidências fotográficas, checklist técnico e emissão
        de laudos com rastreabilidade.
      </p>
    </>
  );
}

export function TenantAuthLayout() {
  return (
    <div className="consulta-page flex min-h-dvh flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link to={ROUTES.consultaLanding} aria-label="Torres Vistorias, ir para Torres Consulta">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={ROUTES.consultaLanding}>Voltar ao site</Link>
            </Button>
            <Button size="sm" className="hidden sm:inline-flex" asChild>
              <Link to={ROUTES.consultar}>Consultar veículo</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="landing-hero-bg relative flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <div className="grid w-full items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,24.5rem)] lg:gap-x-10">
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
