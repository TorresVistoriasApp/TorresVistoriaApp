import { Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/core/auth/use-auth";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/config/routes";

export function AdminLayout() {
  const { platformAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div>
            <p className="ui-microlabel">Painel da plataforma</p>
            <p className="text-[17px] font-bold text-foreground">Torres Vistoria SaaS</p>
          </div>
          <div className="flex items-center gap-3">
            {platformAdmin?.full_name && (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {platformAdmin.full_name}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => void handleSignOut()}>
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
