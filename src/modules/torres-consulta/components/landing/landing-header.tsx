import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronRight,
  CircleHelp,
  FileText,
  LogIn,
  Menu,
  Search,
  Tag,
  X,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import {
  MARKETING_HEADER_NAV,
  MARKETING_PAGE_NAV,
} from "@/modules/torres-consulta/components/marketing/marketing-nav";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { ConsultaBrandLogo } from "./consulta-brand-logo";

const PAGE_NAV_ICONS = {
  [ROUTES.comoFunciona]: CircleHelp,
  [ROUTES.planos]: Tag,
  [ROUTES.relatorioExemplo]: FileText,
} as const;

export function LandingHeader() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-border/60 bg-white/85 shadow-soft backdrop-blur-xl"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">
          <Link to={ROUTES.consultaLanding} aria-label="Torres Consulta, início">
            <ConsultaBrandLogo size="sm" showSubtitle={false} />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navegação principal">
            {MARKETING_HEADER_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" asChild className="text-sky-600 hover:text-sky-700">
              <Link to={ROUTES.vistoriaLogin}>Para Vistoriadores</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={ROUTES.consultaLogin}>Entrar</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to={ROUTES.consultar}>Consultar Veículo</Link>
            </Button>
          </div>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-white/80 text-foreground lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="landing-mobile-menu"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div
          id="landing-mobile-menu"
          className="fixed inset-0 z-[60] flex flex-col bg-white lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
        >
          <div className="landing-grid-bg pointer-events-none absolute inset-0 opacity-[0.05]" />

          <div className="relative flex h-16 shrink-0 items-center justify-between border-b border-border/60 px-4">
            <Link
              to={ROUTES.consultaLanding}
              aria-label="Torres Consulta, início"
              onClick={closeMobileMenu}
            >
              <ConsultaBrandLogo size="sm" showSubtitle={false} />
            </Link>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-white text-foreground shadow-soft"
              onClick={closeMobileMenu}
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
            <nav className="flex flex-col gap-1" aria-label="Navegação mobile">
              <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Explorar
              </p>
              {MARKETING_PAGE_NAV.map((item) => {
                const Icon = PAGE_NAV_ICONS[item.to];
                const isActive = pathname === item.to;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileMenu}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-semibold transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted/70",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        isActive ? "bg-primary/15" : "bg-muted/80",
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </span>
                    {item.label}
                    <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/40" />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto space-y-3 border-t border-border/60 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button size="lg" className="h-12 w-full text-base" asChild>
                <Link to={ROUTES.consultar} onClick={closeMobileMenu}>
                  <Search className="h-5 w-5" strokeWidth={2.25} />
                  Consultar Veículo
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 w-full text-base" asChild>
                <Link to={ROUTES.consultaLogin} onClick={closeMobileMenu}>
                  <LogIn className="h-5 w-5" strokeWidth={2} />
                  Entrar
                </Link>
              </Button>
              <Link
                to={ROUTES.vistoriaLogin}
                onClick={closeMobileMenu}
                className="flex min-h-11 items-center justify-center gap-1.5 text-sm font-semibold text-sky-600 transition-colors hover:text-sky-700"
              >
                Sou vistoriador
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
