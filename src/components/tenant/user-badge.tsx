import { UserAvatar } from "@/components/shared/user-avatar";
import { RoleBadge } from "@/components/tenant/role-badge";
import { cn } from "@/lib/utils";

type UserBadgeSize = "sm" | "md";

const layoutMap: Record<UserBadgeSize, string> = {
  sm: "gap-2",
  md: "gap-3",
};

type UserBadgeProps = {
  name?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
  subtitle?: string | null;
  showRole?: boolean;
  size?: UserBadgeSize;
  className?: string;
};

/** Avatar + nome (+ papel opcional) para listas, sidebar e cards. */
export function UserBadge({
  name,
  avatarUrl,
  role,
  subtitle,
  showRole = false,
  size = "md",
  className,
}: UserBadgeProps) {
  const displayName = name?.trim() || "Usuário";

  return (
    <div className={cn("flex min-w-0 items-center", layoutMap[size], className)}>
      <UserAvatar
        name={displayName}
        avatarUrl={avatarUrl}
        size={size === "sm" ? "sm" : "lg"}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("truncate font-bold text-foreground", size === "sm" ? "text-sm" : "text-sm")}>
            {displayName}
          </p>
          {showRole && role && <RoleBadge role={role} />}
        </div>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
