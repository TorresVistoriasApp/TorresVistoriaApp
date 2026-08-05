import { useUser } from "@/hooks/use-user";
import { UserAvatar } from "@/components/shared/user-avatar";
import { RoleBadge } from "@/components/tenant/role-badge";
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
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate text-sm font-bold text-foreground">{name}</p>
        {role ? (
          <RoleBadge role={role} className="max-w-full truncate" />
        ) : (
          <p className="truncate text-xs text-muted-foreground">{loading ? "…" : "Sem perfil"}</p>
        )}
      </div>
    </div>
  );
}
