import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { getNavSections } from "@/lib/nav-items";
import { isSuperAdmin } from "@/lib/rbac";
import { useAuth } from "@/hooks/use-auth";
import { BrandLogo } from "@/components/shared/brand-logo";
import { SidebarProfile } from "@/components/layout/sidebar-profile";
import { SidebarCollapseToggle } from "@/components/layout/sidebar-collapse-toggle";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { useUiStore } from "@/stores/ui-store";

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
  embedded?: boolean;
}

export function Sidebar({ className, onNavigate, embedded }: SidebarProps) {
  const { profile } = useAuth();
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);
  const collapsed = !embedded && sidebarCollapsed;
  const navSections = getNavSections(isSuperAdmin(profile?.role));

  return (
    <aside className={cn("flex h-full w-full flex-col", className)}>
      {!embedded && (
        collapsed ? (
          <div className="mb-2 flex w-full shrink-0 flex-col items-center gap-1">
            <BrandLogo variant="mark" align="center" className="h-[3.25rem] w-full" />
            <SidebarCollapseToggle collapsed onToggle={toggleSidebarCollapsed} />
          </div>
        ) : (
          <div className="relative mb-4 flex w-full shrink-0 items-center justify-between gap-2 px-1">
            <BrandLogo size="md" variant="full" align="left" />
            <SidebarCollapseToggle
              collapsed={false}
              onToggle={toggleSidebarCollapsed}
              className="hidden md:inline-flex"
            />
          </div>
        )
      )}

      {!embedded && <SidebarProfile className="mb-4" collapsed={collapsed} />}

      <nav className={cn("flex-1", collapsed && "space-y-1.5")}>
        <SidebarNav sections={navSections} collapsed={collapsed} onNavigate={onNavigate} />
      </nav>

      {!embedded && !collapsed && (
        <div className="mt-6 space-y-3 border-t border-border/60 pt-4">
          <p className="px-1 text-[10px] text-muted-foreground">{APP_NAME} · v0.1</p>
        </div>
      )}
    </aside>
  );
}
