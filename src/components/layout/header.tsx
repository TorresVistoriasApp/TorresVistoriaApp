import { Car, ChevronDown, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { NotificationBell } from "@/components/layout/notification-bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export function Header() {
  const { profile, signOut } = useAuth();
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const displayName = profile?.full_name ?? "Usuário";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-20 max-w-full overflow-x-clip border-b border-border/50 bg-card max-md:transform-gpu md:sticky md:bg-card/80 md:backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Car className="h-5 w-5 shrink-0 text-primary max-[360px]:hidden" aria-hidden />
            <p className="truncate text-sm font-semibold text-foreground">
              Boas vindas, {displayName}!
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Abrir menu da conta"
                  className={cn(
                    "group flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/30 px-2 py-1.5 transition-colors",
                    "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                    "data-[state=open]:border-primary/30 data-[state=open]:bg-muted/50",
                    "sm:gap-3 sm:px-3",
                  )}
                >
                  <UserAvatar name={profile?.full_name} avatarUrl={profile?.avatar_url} size="sm" />
                  <div className="hidden min-w-0 text-left md:block">
                    <p className="truncate text-sm font-semibold">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground">Online</p>
                  </div>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                    aria-hidden
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => void signOut()}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <div className="h-14 shrink-0 md:hidden" aria-hidden="true" />
    </>
  );
}
