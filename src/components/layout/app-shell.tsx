import { Outlet } from "react-router-dom";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { Footer } from "@/components/layout/footer";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children?: ReactNode }) {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-dvh overflow-x-clip bg-canvas">
      <aside
        className={cn(
          "sidebar-panel fixed inset-y-0 left-0 z-30 hidden flex-col overflow-visible transition-[width] duration-300 ease-in-out md:flex",
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
          "flex min-h-dvh w-full min-w-0 flex-col overflow-x-clip transition-[padding] duration-300 ease-in-out",
          sidebarCollapsed ? "md:pl-[76px]" : "md:pl-[280px]",
        )}
      >
        <Header />
        <main className="w-full min-w-0 max-w-full flex-1 overflow-x-clip px-4 py-6 pb-28 md:pb-10 lg:px-6 lg:py-8 xl:px-8">
          {children ?? <Outlet />}
        </main>
        <Footer />
      </div>

      <MobileDrawer />
      <MobileNav />
    </div>
  );
}
