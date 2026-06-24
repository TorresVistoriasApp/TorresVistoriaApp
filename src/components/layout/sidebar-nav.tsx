import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { NavLinkItem, NavSection } from "@/lib/nav-items";

interface SidebarNavProps {
  sections: NavSection[];
  collapsed: boolean;
  onNavigate?: () => void;
}

function SidebarNavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavLinkItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const { to, label, icon: Icon, end } = item;

  return (
    <NavLink
      to={to}
      end={end ?? to === "/"}
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
                "gap-2.5 px-2.5 py-1.5",
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
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                isActive ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground",
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            {label}
          </>
        )
      }
    </NavLink>
  );
}

export function SidebarNav({ sections, collapsed, onNavigate }: SidebarNavProps) {
  return (
    <>
      {sections.map((section, index) => (
        <div
          key={section.title}
          className={cn(
            "space-y-0.5",
            index > 0 && (collapsed ? "mt-2 border-t border-border/60 pt-2" : "mt-3 border-t border-border/60 pt-2.5"),
          )}
        >
          {!collapsed && (
            <p className="mb-1 px-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {section.title}
            </p>
          )}

          {section.items.map((item) => (
            <SidebarNavLink
              key={item.to}
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </>
  );
}
