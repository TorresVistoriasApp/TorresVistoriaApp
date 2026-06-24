import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-xl",
};

function getInitials(name?: string | null) {
  if (!name?.trim()) return "TV";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserAvatar({ name, avatarUrl, className, size = "md" }: UserAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ? `Foto de ${name}` : "Foto de perfil"}
        className={cn(
          "shrink-0 rounded-full object-cover shadow-sm ring-2 ring-white",
          sizeMap[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 font-bold text-white shadow-sm ring-2 ring-white",
        sizeMap[size],
        className,
      )}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
