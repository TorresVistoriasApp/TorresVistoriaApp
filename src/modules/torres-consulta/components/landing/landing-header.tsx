import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { ConsultaBrandLogo } from "./consulta-brand-logo";

const NAV_ITEMS = [
  { label: "Início", href: "#inicio" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Planos", href: "#planos" },
  { label: "Perguntas Frequentes", href: "#faq" },
] as const;

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-white/85 shadow-soft backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">
        <Link to={ROUTES.consultaLanding} aria-label="Torres Consulta — Início">
          <ConsultaBrandLogo size="sm" showSubtitle={false} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
          <Link
            to={ROUTES.clienteLogin}
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            Área do Cliente
          </Link>
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link to={ROUTES.vistoriaLogin}>Sou Empresa</Link>
          </Button>
          <Button size="sm" asChild>
            <a href="#consultar">Consultar Veículo</a>
          </Button>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-white/80 text-foreground lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/60 bg-white/95 px-4 py-4 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Navegação mobile">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-xl px-4 py-3 text-sm font-medium text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Link
              to={ROUTES.clienteLogin}
              className="rounded-xl px-4 py-3 text-sm font-medium text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Área do Cliente
            </Link>
            <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3">
              <Button variant="outline" asChild>
                <Link to={ROUTES.vistoriaLogin}>Sou Empresa</Link>
              </Button>
              <Button asChild>
                <a href="#consultar" onClick={() => setMobileOpen(false)}>
                  Consultar Veículo
                </a>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
