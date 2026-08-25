import { Outlet } from "react-router-dom";
import type { ReactNode } from "react";
import { Header } from "@/layouts/components/header";
import { Sidebar } from "@/layouts/components/sidebar";
import { MobileNav } from "@/layouts/components/mobile-nav";
import { MobileDrawer } from "@/layouts/components/mobile-drawer";
import { Footer } from "@/layouts/components/footer";
import { useUiStore } from "@/shared/stores/ui-store";
import { cn } from "@/shared/lib/utils";

export function AppShell({ children }: { children?: ReactNode }) {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-dvh overflow-x-clip bg-canvas">
      <aside
        className={cn(
          "sidebar-panel fixed inset-y-0 left-0 z-30 hidden flex-col overflow-visible transition-[width] duration-200 ease-out md:flex",
          sidebarCollapsed ? "w-[76px]" : "w-[280px]",
        )}
      >
        <div
          className={cn(
            "flex h-full w-full flex-col overflow-y-auto overflow-x-visible",
            sidebarCollapsed ? "items-center px-2.5 pt-1.5 pb-4" : "p-5 lg:p-6",
          )}
        >
          <Sidebar />
        </div>
      </aside>

      <div
        className={cn(
          "flex min-h-dvh w-full min-w-0 flex-col overflow-x-clip transition-[padding] duration-200 ease-out",
          sidebarCollapsed ? "md:pl-[76px]" : "md:pl-[280px]",
        )}
      >
        <Header />
        <main className="w-full min-w-0 max-w-full flex-1 overflow-x-clip px-4 py-6 pb-28 sm:px-6 md:pb-10 lg:px-8 lg:py-8">
          {children ?? <Outlet />}
        </main>
        <Footer />
      </div>

      <MobileDrawer />
      <MobileNav />
    </div>
  );
}
