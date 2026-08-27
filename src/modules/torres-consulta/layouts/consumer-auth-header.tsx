import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { ConsultaBrandLogo } from "@/modules/torres-consulta/components/landing/consulta-brand-logo";

export function ConsumerAuthHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[rgb(16_21_28_/_0.08)] bg-card/95">
      <div className="mx-auto flex h-[4.5rem] w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to={ROUTES.consultaLanding} aria-label="Torres Consulta, ir para o início">
          <ConsultaBrandLogo size="sm" showSubtitle={false} />
        </Link>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-[rgb(16_21_28_/_0.12)] px-4 text-[13px] font-medium tracking-wide"
            asChild
          >
            <Link to={ROUTES.consultaLanding}>Voltar ao site</Link>
          </Button>
          <Button
            size="sm"
            className="hidden h-9 px-4 text-[13px] font-semibold tracking-wide shadow-glow sm:inline-flex"
            asChild
          >
            <Link to={ROUTES.consultar}>Consultar veículo</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
