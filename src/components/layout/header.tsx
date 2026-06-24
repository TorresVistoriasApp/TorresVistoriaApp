import { Car, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { NotificationBell } from "@/components/layout/notification-bell";
import { useUiStore } from "@/stores/ui-store";

export function Header() {
  const { profile, signOut } = useAuth();
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const displayName = profile?.full_name ?? "Usuário";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-20 border-b border-border/50 bg-card max-md:transform-gpu md:sticky md:bg-card/80 md:backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Car className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <p className="truncate text-sm font-semibold text-foreground">
              Boas vindas, {displayName}!
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 px-3 py-1.5 sm:flex">
              <UserAvatar name={profile?.full_name} avatarUrl={profile?.avatar_url} size="sm" />
              <div className="hidden min-w-0 md:block">
                <p className="truncate text-sm font-semibold">{displayName}</p>
                <p className="text-[10px] text-muted-foreground">Online</p>
              </div>
            </div>
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void signOut()}
              aria-label="Sair"
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <div className="h-14 shrink-0 md:hidden" aria-hidden="true" />
    </>
  );
}
