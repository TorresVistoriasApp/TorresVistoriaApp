import { Link, NavLink, Outlet } from "react-router-dom";
import { FileSearch, Home, Plus } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/core/auth/use-auth";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import { Button } from "@/shared/ui/button";
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
    <div className="relative min-h-dvh bg-[#f4f6f9] text-foreground">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#fed7aa]/35 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-[#bfdbfe]/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#fde68a]/20 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link to={ROUTES.consultaApp} className="flex shrink-0 items-center gap-2">
            <span className="text-base font-black tracking-tight text-foreground sm:text-lg">
              Torres <span className="text-primary">Consulta</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-border/50 bg-white/60 p-1 shadow-sm md:flex">
            {DESKTOP_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              asChild
              size="sm"
              className="hidden h-9 rounded-full bg-gradient-to-r from-[#ea580c] to-[#f97316] px-4 shadow-md shadow-primary/20 sm:inline-flex"
            >
              <Link to={ROUTES.consultaAppNovaConsulta}>
                <Plus className="h-4 w-4" />
                Nova consulta
              </Link>
            </Button>

            <ConsumerAccountMenu displayName={displayName} onSignOut={signOut} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 sm:px-6 sm:pb-10 sm:pt-8 md:pb-10">
        <Outlet />
      </main>

      <ConsumerBottomNav />
    </div>
  );
}
