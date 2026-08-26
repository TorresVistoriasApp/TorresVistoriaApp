import { Outlet, Link } from "react-router-dom";
import { BrandLogo } from "@/shared/components/brand-logo";
import { MAIN_CONTENT_ID, SkipLink } from "@/shared/components/skip-link";
import { ROUTES } from "@/config/routes";

export function PublicLayout() {
  return (
    <div className="gradient-mesh min-h-dvh">
      <SkipLink />
      <header className="border-b border-border/60 glass px-4 py-4 lg:px-6">
        <Link to={ROUTES.consultaLanding} aria-label="Torres Consulta, início">
          <BrandLogo size="md" />
        </Link>
      </header>
      <main id={MAIN_CONTENT_ID} className="mx-auto max-w-3xl px-4 py-8" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
