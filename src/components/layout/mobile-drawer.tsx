import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Sidebar } from "@/components/layout/sidebar";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const DRAWER_DURATION_MS = 320;

export function MobileDrawer() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sidebarOpen) {
      setMounted(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
  }, [sidebarOpen]);

  useEffect(() => {
    if (!visible && mounted) {
      const timer = window.setTimeout(() => setMounted(false), DRAWER_DURATION_MS);
      return () => window.clearTimeout(timer);
    }
  }, [visible, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, setSidebarOpen]);

  const close = () => setSidebarOpen(false);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navegação"
    >
      <button
        type="button"
        className={cn(
          "mobile-drawer-overlay absolute inset-0 bg-black/55 backdrop-blur-[3px] transition-opacity duration-300 ease-out motion-reduce:transition-none",
          visible ? "opacity-100" : "opacity-0",
        )}
        aria-label="Fechar menu"
        onClick={close}
      />
      <div
        className={cn(
          "mobile-drawer-panel absolute left-0 top-0 flex h-full w-[min(320px,88vw)] max-w-[320px] flex-col rounded-r-2xl border-r border-border/60 bg-sidebar p-5 shadow-elevated transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none",
          visible ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <BrandLogo size="md" />
          <Button
            variant="ghost"
            size="icon"
            onClick={close}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Sidebar onNavigate={close} className="w-full" embedded />
      </div>
    </div>
  );
}
