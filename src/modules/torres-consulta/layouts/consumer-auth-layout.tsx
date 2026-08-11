import { Link, Outlet } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { ConsultaBrandLogo } from "@/modules/torres-consulta/components/landing/consulta-brand-logo";

export function ConsumerAuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="border-b border-border/40 bg-white/90 px-4 py-5 backdrop-blur-xl sm:px-6">
        <div className="flex justify-center">
          <Link
            to={ROUTES.consultaLanding}
            className="transition-opacity hover:opacity-80"
            aria-label="Torres Consulta, voltar para página inicial"
          >
            <ConsultaBrandLogo size="lg" />
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <Outlet />
      </div>
    </div>
  );
}
