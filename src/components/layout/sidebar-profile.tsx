import { useAuth } from "@/hooks/use-auth";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";

export function SidebarProfile({ className }: { className?: string }) {
  const { profile } = useAuth();
  const name = profile?.full_name ?? "Usuário";
  const role = profile?.role?.replace(/_/g, " ") ?? "Vistoriador";

  return (
    <div className={cn("flex items-center gap-3 rounded-2xl bg-muted/60 p-3", className)}>
      <UserAvatar name={name} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{name}</p>
        <p className="truncate text-xs capitalize text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}
