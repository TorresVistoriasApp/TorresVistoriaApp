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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/70 bg-white/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_32px_rgb(15_23_42_/_0.08)] backdrop-blur-xl md:hidden"
      aria-label="Navegação principal"
    >
      <div className="mx-auto grid h-[4.25rem] max-w-lg grid-cols-3 items-end px-2">
        {NAV_ITEMS.map((item, index) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[10px] font-semibold transition-colors",
              index === 1 && "order-3",
              isActive(pathname, item.to, item.match) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-2xl transition-all",
                isActive(pathname, item.to, item.match) &&
                  "bg-primary/10 shadow-[inset_0_0_0_1px_rgb(234_88_12_/_0.12)]",
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
            className="group -mt-7 flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-[#ea580c] via-[#f97316] to-[#fb923c] text-white shadow-[0_12px_28px_rgb(234_88_12_/_0.38)] ring-4 ring-[#f8fafc] transition-transform active:scale-95"
            aria-label="Nova consulta"
          >
            <Plus className="h-7 w-7" strokeWidth={2.25} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
