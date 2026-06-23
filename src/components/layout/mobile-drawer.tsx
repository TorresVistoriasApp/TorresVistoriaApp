import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        className="absolute inset-0 bg-black/40"
        aria-label="Fechar menu"
        onClick={() => setSidebarOpen(false)}
      />
      <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-background p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-semibold">Menu</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>
    </div>
  );
}
