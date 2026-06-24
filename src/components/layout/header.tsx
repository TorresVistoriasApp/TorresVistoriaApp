import { Car, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/brand-logo";
import { UserAvatar } from "@/components/shared/user-avatar";
import { NotificationBell } from "@/components/layout/notification-bell";
import { useUiStore } from "@/stores/ui-store";

export function Header() {
  const { profile, signOut } = useAuth();
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  return (
    <header className="sticky top-0 z-20 border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex items-center gap-3 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <BrandLogo size="sm" />
        </div>

        <div className="hidden flex-1 items-center gap-2 md:flex">
          <Car className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <p className="truncate text-sm font-semibold text-foreground">
            Boas vindas, {profile?.full_name ?? "Usuário"}!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 px-3 py-1.5 sm:flex">
            <UserAvatar name={profile?.full_name} avatarUrl={profile?.avatar_url} size="sm" />
            <div className="hidden min-w-0 md:block">
              <p className="truncate text-sm font-semibold">{profile?.full_name ?? "Usuário"}</p>
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
  );
}
