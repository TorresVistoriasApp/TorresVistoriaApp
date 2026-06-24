import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { NAV_ITEMS } from "@/lib/nav-items";
import { BrandLogo } from "@/components/shared/brand-logo";
import { SidebarProfile } from "@/components/layout/sidebar-profile";
import { ThemeToggle } from "@/components/shared/theme-toggle";

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
  embedded?: boolean;
}

export function Sidebar({ className, onNavigate, embedded }: SidebarProps) {
  return (
    <aside className={cn("flex h-full flex-col", className)}>
      {!embedded && (
        <div className="mb-6 px-1">
          <BrandLogo size="md" />
        </div>
      )}

      {!embedded && <SidebarProfile className="mb-6" />}

      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Menu
      </p>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.dashboard}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/15"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "bg-muted/60 text-muted-foreground",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {!embedded && (
        <div className="mt-6 space-y-3 border-t border-border/60 pt-4">
          <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground">Tema</span>
            <ThemeToggle />
          </div>
          <p className="px-1 text-[10px] text-muted-foreground">{APP_NAME} · v0.1</p>
        </div>
      )}
    </aside>
  );
}
