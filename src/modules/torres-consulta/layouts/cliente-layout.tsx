import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FileSearch,
  Home,
  LogOut,
  Plus,
  User,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import { consumerAuthService } from "@/core/auth/services/consumer-auth-service";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import { ConsumerBottomNav } from "@/modules/torres-consulta/components/consumer-app/consumer-bottom-nav";
import { ConsultaBrandLogo } from "@/modules/torres-consulta/components/landing/consulta-brand-logo";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const DESKTOP_NAV = [
  { to: ROUTES.consultaApp, label: "Início", icon: Home },
  { to: ROUTES.consultaAppConsultas, label: "Consultas", icon: FileSearch },
  { to: ROUTES.consultaAppMinhaConta, label: "Conta", icon: User },
] as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function ClienteLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resolution } = usePrincipal();

  const displayName =
    resolution.status === "resolved" && resolution.principalType === PrincipalType.CUSTOMER
      ? resolution.consumerProfile.full_name
      : null;

  const handleSignOut = async () => {
    await consumerAuthService.signOut();
    navigate(ROUTES.consultaLogin, { replace: true });
  };

  return (
    <div className="relative min-h-dvh bg-[#f4f7fb]">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_-20%,rgb(234_88_12_/_0.09),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_100%_100%,rgb(148_163_184_/_0.08),transparent_40%)]"
        aria-hidden
      />

      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link to={ROUTES.consultaApp} className="shrink-0 transition-opacity hover:opacity-80">
            <ConsultaBrandLogo size="sm" showSubtitle={false} />
          </Link>

          <nav
            className="hidden items-center gap-1 rounded-2xl border border-border/50 bg-white/60 p-1 md:flex"
            aria-label="Área do consumidor"
          >
            {DESKTOP_NAV.map((item) => {
              const active =
                location.pathname === item.to ||
                (item.to !== ROUTES.consultaApp && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-white hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              className="hidden h-10 rounded-xl shadow-sm md:inline-flex"
            >
              <Link to={ROUTES.consultaAppNovaConsulta}>
                <Plus className="h-4 w-4" />
                Nova consulta
              </Link>
            </Button>

            {displayName && (
              <Link
                to={ROUTES.consultaAppMinhaConta}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-orange-400/10 text-xs font-bold text-primary ring-1 ring-primary/15 transition-transform active:scale-95"
                aria-label="Minha conta"
                title={displayName}
              >
                {getInitials(displayName)}
              </Link>
            )}

            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-white hover:text-foreground md:flex"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 sm:pb-8 md:pb-10 md:pt-8">
        <Outlet />
      </main>

      <ConsumerBottomNav />
    </div>
  );
}
