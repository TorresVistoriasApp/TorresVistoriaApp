import { Link, Outlet } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { TenantAuthBadge } from "@/core/auth/components/tenant-auth-badge";
import { TenantAuthShowcase } from "@/core/auth/components/tenant-auth-showcase";
import { BrandLogo } from "@/shared/components/brand-logo";

export function TenantAuthLayout() {
  return (
    <div className="tenant-auth-shell min-h-dvh lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <TenantAuthShowcase className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh" />

      <div className="tenant-auth-form-side relative flex min-h-dvh min-w-0 flex-col">
        <header className="relative border-b border-border bg-card px-4 py-5 sm:px-6 lg:hidden">
          <div className="flex flex-col items-center gap-3">
            <Link
              to={ROUTES.consultaLanding}
              className="transition-opacity hover:opacity-80"
              aria-label="Torres Vistorias, ir para Torres Consulta"
            >
              <BrandLogo size="md" align="center" />
            </Link>
            <TenantAuthBadge />
          </div>
        </header>

        <main className="relative flex flex-1 flex-col justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-12 lg:py-10 xl:px-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
