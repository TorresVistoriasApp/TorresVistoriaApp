import { NavLink } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { getNavItems } from "@/routes/navigation";
import { ROUTES } from "@/config/routes";
import { usePermission } from "@/core/rbac/use-permission";
import { useUiStore } from "@/shared/stores/ui-store";

interface MobileNavProps {
  className?: string;
}

/** Slots da barra: acima disso o excedente vai para o drawer, liberando espaço para os rótulos. */
const MAX_SLOTS = 5;

const slotClass =
  "flex min-h-[52px] min-w-0 flex-1 basis-0 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1.5 text-[10px] font-bold leading-tight transition-colors duration-150";

const labelClass = "block w-full truncate text-center";

export function MobileNav({ className }: MobileNavProps) {
  const { has, hasAny } = usePermission();
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  const items = getNavItems({ has, hasAny });
  const needsOverflow = items.length > MAX_SLOTS;
  const visibleItems = needsOverflow ? items.slice(0, MAX_SLOTS - 1) : items;

  return (
    <nav
      className={cn("fixed bottom-3 left-3 right-3 z-40 md:hidden", className)}
      aria-label="Navegação principal"
    >
      <div className="flex items-stretch gap-0.5 rounded-2xl border border-border bg-card px-1 py-1 shadow-elevated safe-area-inset-bottom">
        {visibleItems.map(({ to, shortLabel, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end ?? to === ROUTES.dashboard}
            className={({ isActive }) =>
              cn(
                slotClass,
                isActive
                  ? "bg-brand-subtle text-brand-emphasis"
                  : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
            <span className={labelClass}>{shortLabel}</span>
          </NavLink>
        ))}

        {needsOverflow && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu completo"
            className={cn(slotClass, "text-muted-foreground hover:text-foreground")}
          >
            <MoreHorizontal className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
            <span className={labelClass}>Menu</span>
          </button>
        )}
      </div>
    </nav>
  );
}
