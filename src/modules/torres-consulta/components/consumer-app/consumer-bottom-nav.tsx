import { Link, useLocation } from "react-router-dom";
import { FileSearch, Home, Plus } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { cn } from "@/shared/lib/utils";

const NAV_ITEMS = [
  { to: ROUTES.consultaApp, label: "Início", icon: Home, match: "exact" as const },
  {
    to: ROUTES.consultaAppConsultas,
    label: "Consultas",
    icon: FileSearch,
    match: "prefix" as const,
  },
] as const;

function isActive(pathname: string, to: string, match: "exact" | "prefix") {
  if (match === "exact") return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function ConsumerBottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Navegação principal"
    >
      <div className="mx-auto grid h-[4.25rem] max-w-lg grid-cols-3 items-end px-2">
        {NAV_ITEMS.map((item, index) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-lg py-2 text-[10px] font-semibold transition-colors",
              index === 1 && "order-3",
              isActive(pathname, item.to, item.match) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                isActive(pathname, item.to, item.match) && "bg-brand-subtle",
              )}
            >
              <item.icon
                className="h-[18px] w-[18px]"
                strokeWidth={isActive(pathname, item.to, item.match) ? 2.25 : 2}
              />
            </span>
            {item.label}
          </Link>
        ))}

        <div className="order-2 flex justify-center">
          <Link
            to={ROUTES.consultaAppNovaConsulta}
            className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow ring-4 ring-card transition-colors hover:bg-primary-hover"
            aria-label="Nova consulta"
          >
            <Plus className="h-7 w-7" strokeWidth={2.25} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
