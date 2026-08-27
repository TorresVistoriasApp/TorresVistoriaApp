import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
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
    const onScroll = () => setScrolled(window.scrollY > 14);
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
          "landing-header fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-350",
          scrolled
            ? "border-b border-[rgb(16_21_28_/_0.08)] bg-[#f7f5f2]/88 shadow-[0_10px_40px_rgb(16_21_28_/_0.07)] backdrop-blur-2xl"
            : onDarkHero
              ? "border-b border-white/[0.07] bg-gradient-to-b from-black/70 via-black/45 to-black/20 backdrop-blur-md"
              : "border-b border-transparent bg-transparent",
        )}
      >
        {/* Linha de luz no topo */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-px",
            onDarkHero && !scrolled
              ? "bg-gradient-to-r from-transparent via-primary/50 to-transparent"
              : scrolled
                ? "bg-gradient-to-r from-transparent via-primary/25 to-transparent"
                : "bg-transparent",
          )}
          aria-hidden
        />

        <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto] items-center gap-3 px-4 sm:h-[4.25rem] sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
          {/* Logo */}
          <Link
            to={ROUTES.consultaLanding}
            aria-label="Torres Consulta, início"
            className="group z-10 justify-self-start transition-opacity duration-200 hover:opacity-90"
          >
            <ConsultaBrandLogo
              size="sm"
              showSubtitle={false}
              onDark={onDarkHero && !scrolled}
            />
          </Link>

          {/* Nav desktop — tipografia editorial, sem cápsula */}
          <nav
            className="z-10 hidden items-center justify-center gap-1 lg:flex"
            aria-label="Navegação principal"
          >
            {MARKETING_HEADER_NAV.map((item) => {
              const isActive = pathname === item.to;
              const isVistoriador = item.to === ROUTES.vistoriaLogin;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group/nav relative inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium tracking-[0.02em] transition-colors duration-200",
                    onDarkHero && !scrolled
                      ? isActive
                        ? "text-white"
                        : "text-white/65 hover:text-white"
                      : isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {isVistoriador ? (
                    <ClipboardCheck
                      className="h-3.5 w-3.5 text-primary opacity-90"
                      strokeWidth={2.25}
                      aria-hidden
                    />
                  ) : null}
                  {item.label}
                  <span
                    className={cn(
                      "pointer-events-none absolute inset-x-3 bottom-1 h-[2px] origin-center rounded-full transition-all duration-300 ease-out",
                      isActive
                        ? "scale-x-100 opacity-100"
                        : "scale-x-0 opacity-0 group-hover/nav:scale-x-100 group-hover/nav:opacity-100",
                      onDarkHero && !scrolled ? "bg-[#ff9a5c]" : "bg-primary",
                    )}
                    aria-hidden
                  />
                </Link>
              );
            })}
          </nav>

          {/* Ações */}
          <div className="z-10 flex items-center justify-end gap-2 sm:gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "hidden h-9 px-3 text-[13px] font-semibold tracking-wide sm:inline-flex",
                onDarkHero && !scrolled
                  ? "text-white/85 hover:bg-white/10 hover:text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
              asChild
            >
              <Link to={ROUTES.consultaLogin}>
                <LogIn className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                Entrar
              </Link>
            </Button>

            <Button
              size="sm"
              className={cn(
                "group/cta relative h-9 overflow-hidden px-3.5 text-[13px] font-semibold tracking-wide shadow-glow sm:px-4",
                "transition-transform duration-200 hover:scale-[1.02]",
              )}
              asChild
            >
              <Link to={ROUTES.consultar}>
                <span
                  className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/cta:translate-x-[120%]"
                  aria-hidden
                />
                <Search className="relative h-3.5 w-3.5 sm:hidden" strokeWidth={2.5} aria-hidden />
                <span className="relative hidden sm:inline">Consultar veículo</span>
                <span className="relative sm:hidden">Consultar</span>
              </Link>
            </Button>

            <button
              type="button"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-200 lg:hidden",
                onDarkHero && !scrolled
                  ? "border-white/20 bg-white/[0.07] text-white hover:bg-white/15"
                  : "border-border bg-card/80 text-foreground hover:border-primary/30",
              )}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls="landing-mobile-menu"
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div
          id="landing-mobile-menu"
          className="fixed inset-0 z-[60] flex flex-col lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
        >
          {/* Overlay */}
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-label="Fechar menu"
            onClick={closeMobileMenu}
          />

          {/* Painel deslizante */}
          <div className="landing-mobile-sheet relative ml-auto flex h-full w-full max-w-[22rem] flex-col border-l border-white/10 bg-[#0c1017] shadow-[-24px_0_64px_rgb(0_0_0_/_0.45)] sm:max-w-[24rem]">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/15 to-transparent"
              aria-hidden
            />

            <div className="relative flex h-16 shrink-0 items-center justify-between px-5">
              <ConsultaBrandLogo size="sm" showSubtitle={false} onDark />
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white"
                onClick={closeMobileMenu}
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Navegação
              </p>

              <nav className="flex flex-col gap-1" aria-label="Navegação mobile">
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
                        "flex items-center gap-3 rounded-xl px-3 py-3.5 text-[15px] font-semibold transition-colors",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-white/70 hover:bg-white/[0.06] hover:text-white",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                          isActive
                            ? "border-primary/35 bg-primary/15 text-primary"
                            : "border-white/10 bg-white/[0.04] text-white/70",
                        )}
                      >
                        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                      </span>
                      {item.label}
                      <ChevronRight className="ml-auto h-4 w-4 text-white/30" />
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto space-y-3 border-t border-white/10 pt-5">
                <Button size="lg" className="h-12 w-full text-base shadow-glow" asChild>
                  <Link to={ROUTES.consultar} onClick={closeMobileMenu}>
                    <Search className="h-5 w-5" strokeWidth={2.25} />
                    Consultar veículo
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full border-white/20 bg-transparent text-base text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link to={ROUTES.consultaLogin} onClick={closeMobileMenu}>
                    <LogIn className="h-5 w-5" strokeWidth={2} />
                    Entrar na conta
                  </Link>
                </Button>
                <Link
                  to={ROUTES.vistoriaLogin}
                  onClick={closeMobileMenu}
                  className="flex min-h-11 items-center justify-center gap-2 text-sm font-medium text-white/55 transition-colors hover:text-white"
                >
                  <ClipboardCheck className="h-4 w-4 text-primary" strokeWidth={2} aria-hidden />
                  Sou vistoriador
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
