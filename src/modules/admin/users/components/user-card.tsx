import { Pencil, UserMinus, UserPlus } from "lucide-react";
import { UserRole } from "@/core/rbac/roles";
import { RoleBadge } from "@/core/tenant/components/role-badge";
import { cn } from "@/shared/lib/utils";
import { formatDate } from "@/shared/lib/formatters";
import type { TeamProfile } from "@/modules/admin/users/services/user-service";
import { Button } from "@/shared/ui/button";

interface UserCardProps {
  user: TeamProfile;
  isCurrentUser: boolean;
  onEdit: (user: TeamProfile) => void;
  onToggleActive: (user: TeamProfile) => void;
  isToggling?: boolean;
}

export function UserCard({
  user,
  isCurrentUser,
  onEdit,
  onToggleActive,
  isToggling,
}: UserCardProps) {
  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;

  return (
    <article className="ui-panel ui-panel-interactive flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[17px] font-bold text-foreground">{user.full_name}</h3>
            <RoleBadge role={user.role} />
            {!user.is_active && (
              <span className="ui-chip-negative uppercase tracking-wide">Inativo</span>
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">{user.email ?? "—"}</p>
          {user.phone && <p className="truncate text-sm text-muted-foreground">{user.phone}</p>}
          <p className="text-xs text-muted-foreground">{formatDate(user.created_at)}</p>
        </div>

        {!isCurrentUser && (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" size="sm" onClick={() => onEdit(user)}>
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(user.is_active ? "text-destructive" : "text-success")}
              disabled={isToggling}
              onClick={() => onToggleActive(user)}
            >
              {user.is_active ? (
                <>
                  <UserMinus className="h-4 w-4" />
                  Desativar
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Reativar
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
        {isSuperAdmin ? (
          <p>
            Acesso completo à plataforma. Super Admin gerencia usuários, auditoria, financeiro e configurações da empresa.
          </p>
        ) : (
          <p>
            Perfil operacional para realizar vistorias, laudos e relatórios conforme permissões do vistoriador.
          </p>
        )}
        {user.must_change_password && (
          <p className="mt-2 font-semibold text-warning">
            Este usuário ainda precisa trocar a senha inicial no primeiro acesso.
          </p>
        )}
        {isCurrentUser && (
          <p className="mt-2 font-semibold text-foreground">Esta é a sua conta.</p>
        )}
      </div>
    </article>
  );
}
