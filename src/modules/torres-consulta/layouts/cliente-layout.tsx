import { Link, NavLink, Outlet } from "react-router-dom";
import { FileSearch, Home, Plus } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/core/auth/use-auth";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import { Button } from "@/shared/ui/button";
import { ConsultaBrandLogo } from "@/modules/torres-consulta/components/landing/consulta-brand-logo";
import { ConsumerAccountMenu } from "@/modules/torres-consulta/components/consumer-app/consumer-account-menu";
import { ConsumerBottomNav } from "@/modules/torres-consulta/components/consumer-app/consumer-bottom-nav";
import { cn } from "@/shared/lib/utils";

const DESKTOP_NAV = [
  { to: ROUTES.consultaApp, label: "Início", icon: Home, end: true },
  { to: ROUTES.consultaAppConsultas, label: "Consultas", icon: FileSearch, end: false },
] as const;

export function ClienteLayout() {
  const { signOut } = useAuth();
  const { resolution } = usePrincipal();

  const displayName =
    resolution.status === "resolved" && resolution.principalType === PrincipalType.CUSTOMER
      ? resolution.consumerProfile.full_name
      : "Cliente";

  return (
    <div className="consulta-page min-h-dvh text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link to={ROUTES.consultaApp} className="shrink-0" aria-label="Torres Consulta, início">
            <ConsultaBrandLogo size="sm" showSubtitle={false} />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação da conta">
            {DESKTOP_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-brand-subtle text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                <item.icon className="h-4 w-4" aria-hidden />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button size="sm" className="hidden sm:inline-flex" asChild>
              <Link to={ROUTES.consultaAppNovaConsulta}>
                <Plus className="h-4 w-4" aria-hidden />
                Nova consulta
              </Link>
            </Button>
            <ConsumerAccountMenu displayName={displayName} onSignOut={signOut} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <Outlet />
      </main>

      <ConsumerBottomNav />
    </div>
  );
}
