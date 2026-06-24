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
      className={cn("fixed bottom-3 left-3 right-3 z-40 md:hidden", className)}
      aria-label="Navegação principal"
    >
      <div className="flex items-stretch justify-around rounded-2xl border border-border/50 bg-card/95 px-1 py-1 shadow-elevated backdrop-blur-xl safe-area-inset-bottom">
        {NAV_ITEMS.map(({ to, shortLabel, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end ?? to === ROUTES.dashboard}
            className={({ isActive }) =>
              cn(
                "touch-target flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>{shortLabel}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
