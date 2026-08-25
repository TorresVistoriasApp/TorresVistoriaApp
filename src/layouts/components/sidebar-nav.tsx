import { NavLink } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import type { NavLinkItem, NavSection } from "@/routes/navigation";

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
          "flex items-center rounded-lg text-sm font-semibold transition-colors duration-150",
          collapsed
            ? cn(
                "mx-auto h-10 w-10 justify-center p-0",
                isActive
                  ? "bg-brand-subtle text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            : cn(
                "gap-2.5 px-2.5 py-2",
                isActive
                  ? "bg-brand-subtle text-brand-emphasis"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
                "h-8 w-8 transition-colors",
                isActive ? "ui-icon-box" : "ui-icon-box ui-icon-box-neutral",
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
            index > 0 && (collapsed ? "mt-2 border-t border-border pt-2" : "mt-3 border-t border-border pt-2.5"),
          )}
        >
          {!collapsed && (
            <p className="ui-microlabel mb-1.5 block px-2.5">{section.title}</p>
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
