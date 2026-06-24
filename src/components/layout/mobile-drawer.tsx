import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Sidebar } from "@/components/layout/sidebar";
import { useUiStore } from "@/stores/ui-store";

export function MobileDrawer() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  if (!sidebarOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Fechar menu"
        onClick={() => setSidebarOpen(false)}
      />
      <div className="surface-elevated absolute left-0 top-0 flex h-full w-80 flex-col p-5 shadow-elevated">
        <div className="mb-6 flex items-center justify-between">
          <BrandLogo size="md" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Sidebar onNavigate={() => setSidebarOpen(false)} className="w-full" embedded />
      </div>
    </div>
  );
}
