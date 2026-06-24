import { Outlet, Link } from "react-router-dom";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ROUTES } from "@/lib/constants";

export function PublicLayout() {
  return (
    <div className="gradient-mesh min-h-dvh">
      <header className="border-b border-border/60 glass px-4 py-4 lg:px-6">
        <Link to={ROUTES.login}>
          <BrandLogo size="md" />
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
