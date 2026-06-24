import { Outlet } from "react-router-dom";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { Footer } from "@/components/layout/footer";

export function AppShell({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <aside className="sidebar-panel fixed inset-y-0 left-0 z-30 hidden w-[280px] flex-col md:flex">
        <div className="flex h-full flex-col overflow-y-auto p-5 lg:p-6">
          <Sidebar />
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col md:pl-[280px]">
        <Header />
        <main className="w-full flex-1 px-4 py-6 pb-28 md:pb-10 lg:px-6 lg:py-8 xl:px-8">
          {children ?? <Outlet />}
        </main>
        <Footer />
      </div>

      <MobileDrawer />
      <MobileNav />
    </div>
  );
}
