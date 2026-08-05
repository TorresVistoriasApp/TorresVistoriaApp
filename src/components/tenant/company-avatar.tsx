import { cn } from "@/lib/utils";
import { getCompanyInitials } from "@/lib/company-display";

type CompanyAvatarSize = "sm" | "md" | "lg";

const sizeMap: Record<CompanyAvatarSize, string> = {
  sm: "h-8 w-8 text-xs rounded-lg",
  md: "h-10 w-10 text-sm rounded-xl",
  lg: "h-12 w-12 text-base rounded-xl",
};

type CompanyAvatarProps = {
  tradeName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  size?: CompanyAvatarSize;
  className?: string;
};

/** Avatar da empresa (logo ou iniciais do nome fantasia). */
export function CompanyAvatar({
  tradeName,
  logoUrl,
  primaryColor,
  size = "md",
  className,
}: CompanyAvatarProps) {
  const label = tradeName?.trim() || "Empresa";

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`Logo ${label}`}
        className={cn("shrink-0 object-contain bg-white p-0.5 shadow-sm ring-1 ring-border/60", sizeMap[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center font-bold text-white shadow-sm ring-1 ring-border/40",
        sizeMap[size],
        className,
      )}
      style={{ backgroundColor: primaryColor ?? "hsl(var(--primary))" }}
      aria-hidden
    >
      {getCompanyInitials(tradeName)}
    </div>
  );
}
