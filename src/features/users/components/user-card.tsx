import { Pencil, UserMinus, UserPlus } from "lucide-react";
import { UserRole } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";
import type { TeamProfile } from "@/services/user-service";
import { Button } from "@/components/ui/button";

const ROLE_LABELS: Record<string, string> = {
  [UserRole.SUPER_ADMIN]: "Super Admin",
  [UserRole.VISTORIADOR]: "Vistoriador",
};

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
    <article className="flex h-full flex-col rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-foreground">{user.full_name}</h3>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                isSuperAdmin
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
            {!user.is_active && (
              <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-destructive">
                Inativo
              </span>
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">{user.email ?? "—"}</p>
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
              className={cn(
                user.is_active
                  ? "border-destructive/30 text-destructive hover:bg-destructive/5"
                  : "border-emerald-300 text-emerald-700 hover:bg-emerald-50",
              )}
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

      <div className="mt-4 rounded-xl border border-border/50 bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
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
          <p className="mt-2 font-medium text-amber-700">
            Este usuário ainda precisa trocar a senha inicial no primeiro acesso.
          </p>
        )}
        {isCurrentUser && (
          <p className="mt-2 font-medium text-foreground">Esta é a sua conta.</p>
        )}
      </div>
    </article>
  );
}
