import { Outlet } from "react-router-dom";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { Footer } from "@/components/layout/footer";

export function AppShell({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-dvh bg-muted/30">
      <Header />

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <Sidebar className="hidden md:block" />
        <main className="min-w-0 flex-1 pb-20 md:pb-8">{children ?? <Outlet />}</main>
      </div>

      <MobileDrawer />
      <MobileNav />
      <Footer />
    </div>
  );
}
