import { useUser } from "@/hooks/use-user";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";

export function SidebarProfile({
  className,
  collapsed,
}: {
  className?: string;
  collapsed?: boolean;
}) {
  const { fullName, avatarUrl, role, loading } = useUser();
  const name = fullName ?? (loading ? "Carregando…" : "Usuário");
  const roleLabel = role?.replace(/_/g, " ") ?? (loading ? "…" : "Sem perfil");

  if (collapsed) {
    return (
      <div className={cn("flex justify-center", className)} title={name}>
        <UserAvatar name={name} avatarUrl={avatarUrl} size="sm" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 rounded-2xl bg-muted/60 p-3", className)}>
      <UserAvatar name={name} avatarUrl={avatarUrl} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{name}</p>
        <p className="truncate text-xs capitalize text-muted-foreground">{roleLabel}</p>
      </div>
    </div>
  );
}
