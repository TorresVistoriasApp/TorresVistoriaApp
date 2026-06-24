import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav-items";
import { ROUTES } from "@/lib/constants";

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background safe-area-inset-bottom md:hidden",
        className,
      )}
      aria-label="Navegação principal"
    >
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map(({ to, shortLabel, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.dashboard}
            className={({ isActive }) =>
              cn(
                "touch-target flex min-h-[44px] flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{shortLabel}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
