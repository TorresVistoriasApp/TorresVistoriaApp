import { useAuth } from "@/hooks/use-auth";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";

export function SidebarProfile({
  className,
  collapsed,
}: {
  className?: string;
  collapsed?: boolean;
}) {
  const { profile, loading } = useAuth();
  const name = profile?.full_name ?? (loading ? "Carregando…" : "Usuário");
  const role = profile?.role?.replace(/_/g, " ") ?? (loading ? "…" : "Sem perfil");

  if (collapsed) {
    return (
      <div className={cn("flex justify-center", className)} title={name}>
        <UserAvatar name={name} avatarUrl={profile?.avatar_url} size="sm" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 rounded-2xl bg-muted/60 p-3", className)}>
      <UserAvatar name={name} avatarUrl={profile?.avatar_url} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{name}</p>
        <p className="truncate text-xs capitalize text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}
