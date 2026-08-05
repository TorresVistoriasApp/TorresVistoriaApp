import { UserRole } from "@/core/rbac/roles";
import { getRoleLabel } from "@/core/rbac/roles";
import { cn } from "@/shared/lib/utils";

const ROLE_STYLES: Record<string, string> = {
  [UserRole.SUPER_ADMIN]: "bg-primary/10 text-primary border-primary/20",
  [UserRole.INSPECTOR]: "bg-muted text-muted-foreground border-border",
};

type RoleBadgeProps = {
  role: string;
  className?: string;
};

/** Badge visual do papel do usuário no tenant. */
export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        ROLE_STYLES[role] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      {getRoleLabel(role)}
    </span>
  );
}
