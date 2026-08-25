import { Link, Outlet } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { ConsultaBrandLogo } from "@/modules/torres-consulta/components/landing/consulta-brand-logo";

const SELLING_POINTS = [
  "Leilão, sinistro, roubo, débitos e restrições",
  "Relatório em PDF disponível na hora",
  "Histórico salvo na sua conta para consultar depois",
] as const;

export function ConsumerAuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col lg:grid lg:min-h-dvh lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]">
      {/* Coluna de marca: só aparece a partir de lg para não pesar no mobile */}
      <aside className="tenant-auth-showcase hidden flex-col justify-between p-10 text-ink-foreground lg:flex xl:p-12">
        <Link
          to={ROUTES.consultaLanding}
          className="w-fit rounded-md"
          aria-label="Torres Consulta, voltar para a página inicial"
        >
          <ConsultaBrandLogo size="lg" onDark />
        </Link>

        <div>
          <h2 className="max-w-sm text-balance text-[1.75rem] font-bold leading-[1.15] text-ink-foreground">
            Saiba tudo sobre o veículo antes de pagar por ele
          </h2>
          <ul className="mt-7 space-y-3.5">
            {SELLING_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-ink-foreground/85">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-ink-muted">
          Seus dados são tratados conforme a LGPD. Parte do Ecossistema Torres.
        </p>
      </aside>

      <div className="tenant-auth-form-side flex flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 lg:border-0 lg:bg-transparent lg:px-8 lg:py-6">
          <Link
            to={ROUTES.consultaLanding}
            className="lg:hidden"
            aria-label="Torres Consulta, voltar para a página inicial"
          >
            <ConsultaBrandLogo size="sm" showSubtitle={false} />
          </Link>
          <Link
            to={ROUTES.consultaLanding}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voltar ao site
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:py-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
