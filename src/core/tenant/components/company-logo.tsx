import { useTenantContext } from "@/core/tenant/tenant-context";
import { getCompanyInitials } from "@/core/tenant/company-display";
import { cn } from "@/shared/lib/utils";

type CompanyLogoSize = "sm" | "md" | "lg";

const imageSizeMap: Record<CompanyLogoSize, string> = {
  sm: "h-8 max-w-[120px]",
  md: "h-10 max-w-[160px]",
  lg: "h-14 max-w-[220px]",
};

type CompanyLogoProps = {
  tradeName?: string | null;
  logoUrl?: string | null;
  size?: CompanyLogoSize;
  className?: string;
  /** Quando true (padrão), usa dados do TenantProvider se props não forem passadas. */
  fromContext?: boolean;
};

/** Logo da empresa tenant (diferente do BrandLogo do produto Torres Vistoria). */
export function CompanyLogo({
  tradeName: tradeNameProp,
  logoUrl: logoUrlProp,
  size = "md",
  className,
  fromContext = true,
}: CompanyLogoProps) {
  const { company } = useTenantContext();
  const tradeName = tradeNameProp ?? (fromContext ? company?.trade_name : null);
  const logoUrl = logoUrlProp ?? (fromContext ? company?.logo_url : null);
  const label = tradeName?.trim() || "Empresa";

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={label}
        className={cn("w-auto shrink-0 object-contain object-left", imageSizeMap[size], className)}
        decoding="async"
        draggable={false}
      />
    );
  }

  return (
    <span
      className={cn(
        "truncate font-semibold text-foreground",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-lg",
        className,
      )}
      title={label}
    >
      {tradeName?.trim() || getCompanyInitials(tradeName)}
    </span>
  );
}
