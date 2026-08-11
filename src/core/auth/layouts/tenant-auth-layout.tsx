import { Link, Outlet } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { TenantAuthBadge } from "@/core/auth/components/tenant-auth-badge";
import { TenantAuthShowcase } from "@/core/auth/components/tenant-auth-showcase";
import { BrandLogo } from "@/shared/components/brand-logo";

export function TenantAuthLayout() {
  return (
    <div className="min-h-dvh bg-slate-950 lg:grid lg:grid-cols-[1.1fr_1fr]">
      <TenantAuthShowcase className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh" />

      <div className="relative flex min-h-dvh min-w-0 flex-col overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_45%_at_50%_-5%,rgb(234_88_12_/_0.18),transparent_60%)] lg:bg-[radial-gradient(ellipse_70%_50%_at_100%_0%,rgb(234_88_12_/_0.1),transparent_60%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255_/_0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255_/_0.04)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          aria-hidden
        />

        <header className="relative flex flex-col items-center gap-3 px-4 pt-8 sm:px-6 lg:hidden">
          <Link
            to={ROUTES.consultaLanding}
            className="transition-opacity hover:opacity-80"
            aria-label="Torres Vistorias, ir para Torres Consulta"
          >
            <BrandLogo size="md" align="center" />
          </Link>
          <TenantAuthBadge />
        </header>

        <main className="relative flex flex-1 flex-col justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-10 lg:py-10 xl:px-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
