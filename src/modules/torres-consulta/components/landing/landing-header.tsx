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

  /** Hero escuro só na home; demais páginas de marketing ficam claras. */
  const onDarkHero = pathname === ROUTES.consultaLanding && !scrolled;

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
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-200",
          scrolled
            ? "border-border bg-card shadow-soft"
            : onDarkHero
              ? "border-white/10 bg-black/25"
              : "border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link to={ROUTES.consultaLanding} aria-label="Torres Consulta, início">
            <ConsultaBrandLogo size="sm" showSubtitle={false} onDark={onDarkHero} />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
            {MARKETING_HEADER_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-md px-3.5 py-2 text-[13px] font-medium tracking-wide transition-colors",
                  onDarkHero
                    ? "text-white/70 hover:bg-white/10 hover:text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 md:flex">
            <Button
              variant="outline"
              size="sm"
              className={
                onDarkHero
                  ? "h-9 border-white/25 bg-transparent px-4 text-white hover:border-white/40 hover:bg-white/10 hover:text-white"
                  : undefined
              }
              asChild
            >
              <Link to={ROUTES.consultaLogin}>Entrar</Link>
            </Button>
            <Button size="sm" className="h-9 px-4 shadow-glow" asChild>
              <Link to={ROUTES.consultar}>Consultar Veículo</Link>
            </Button>
          </div>

          <button
            type="button"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md border lg:hidden",
              onDarkHero
                ? "border-white/20 bg-white/10 text-white"
                : "border-border bg-card text-foreground",
            )}
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
          className="fixed inset-0 z-[60] flex flex-col bg-card lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
        >
          <div className="relative flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
            <Link
              to={ROUTES.consultaLanding}
              aria-label="Torres Consulta, início"
              onClick={closeMobileMenu}
            >
              <ConsultaBrandLogo size="sm" showSubtitle={false} />
            </Link>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-foreground"
              onClick={closeMobileMenu}
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
            <nav className="flex flex-col gap-1" aria-label="Navegação mobile">
              <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.1em] text-subtle-foreground">
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
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-semibold transition-colors",
                      isActive ? "bg-brand-subtle text-primary" : "text-foreground hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                        isActive
                          ? "border-primary/20 bg-brand-subtle"
                          : "border-border bg-muted",
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                    </span>
                    {item.label}
                    <ChevronRight className="ml-auto h-4 w-4 text-subtle-foreground" />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto space-y-2.5 border-t border-border pt-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
                className="flex min-h-11 items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
