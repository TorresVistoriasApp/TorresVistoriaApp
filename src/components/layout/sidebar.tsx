import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { NAV_ITEMS } from "@/lib/nav-items";
import { BrandLogo } from "@/components/shared/brand-logo";
import { SidebarProfile } from "@/components/layout/sidebar-profile";
import { SidebarCollapseToggle } from "@/components/layout/sidebar-collapse-toggle";
import { useUiStore } from "@/stores/ui-store";

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
  embedded?: boolean;
}

export function Sidebar({ className, onNavigate, embedded }: SidebarProps) {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);
  const collapsed = !embedded && sidebarCollapsed;

  return (
    <aside className={cn("flex h-full w-full flex-col", className)}>
      {!embedded && (
        collapsed ? (
          <div className="mb-5 flex w-full flex-col items-center gap-3">
            <BrandLogo size="md" variant="mark" align="center" />
            <SidebarCollapseToggle collapsed onToggle={toggleSidebarCollapsed} />
          </div>
        ) : (
          <div className="relative mb-5 flex w-full shrink-0 items-center justify-between gap-2 px-1">
            <BrandLogo size="md" variant="full" align="left" />
            <SidebarCollapseToggle
              collapsed={false}
              onToggle={toggleSidebarCollapsed}
              className="hidden md:inline-flex"
            />
          </div>
        )
      )}

      {!embedded && <SidebarProfile className={cn("mb-5", collapsed && "mb-6")} collapsed={collapsed} />}

      {!collapsed && (
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Menu
        </p>
      )}

      <nav className={cn("flex-1 space-y-1", collapsed && "space-y-1.5")}>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.dashboard}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            aria-label={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-xl text-sm font-semibold transition-all duration-200",
                collapsed
                  ? cn(
                      "mx-auto h-10 w-10 justify-center p-0",
                      isActive
                        ? "bg-primary/12 text-primary"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                    )
                  : cn(
                      "gap-3 px-3 py-2.5",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/15"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                    ),
              )
            }
          >
            {({ isActive }) =>
              collapsed ? (
                <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.25 : 2} />
              ) : (
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
              )
            }
          </NavLink>
        ))}
      </nav>

      {!embedded && !collapsed && (
        <div className="mt-6 space-y-3 border-t border-border/60 pt-4">
          <p className="px-1 text-[10px] text-muted-foreground">{APP_NAME} · v0.1</p>
        </div>
      )}
    </aside>
  );
}
