import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";

export function AuthPageHeader({
  logo,
  logoTo = ROUTES.consultaLanding,
  logoAriaLabel,
}: {
  logo: ReactNode;
  logoTo?: string;
  logoAriaLabel: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to={logoTo} aria-label={logoAriaLabel}>
          {logo}
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
  );
}
