import { Link } from "react-router-dom";
import { ChevronDown, LogOut, User } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { UserAvatar } from "@/shared/components/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

interface ConsumerAccountMenuProps {
  displayName: string;
  onSignOut: () => void | Promise<void>;
}

export function ConsumerAccountMenu({ displayName, onSignOut }: ConsumerAccountMenuProps) {
  const firstName = displayName.split(" ")[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Abrir menu da conta"
          className={cn(
            "group flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5",
            "transition-colors duration-150 hover:bg-muted data-[state=open]:bg-muted",
            "sm:gap-2.5 sm:px-2.5",
          )}
        >
          <UserAvatar name={displayName} size="sm" />
          <div className="hidden min-w-0 text-left sm:block">
            <p className="max-w-[7rem] truncate text-sm font-semibold text-foreground">{firstName}</p>
            <p className="text-[10px] text-muted-foreground">Minha conta</p>
          </div>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link to={ROUTES.consultaAppMinhaConta} className="cursor-pointer">
            <User className="h-4 w-4" />
            Meu perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void onSignOut()}
          className="cursor-pointer text-destructive focus:bg-destructive-subtle focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
