import { CompanyAvatar } from "@/components/tenant/company-avatar";
import {
  COMPANY_STATUS_BADGE_CLASS,
  getCompanyPlanLabel,
  getCompanyStatusLabel,
} from "@/lib/company-display";
import { cn } from "@/lib/utils";

type CompanyBadgeProps = {
  tradeName: string;
  legalName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  subscriptionPlan?: string | null;
  status?: string | null;
  showAvatar?: boolean;
  className?: string;
};

/** Resumo visual de uma empresa (avatar, nome e chips de plano/status). */
export function CompanyBadge({
  tradeName,
  legalName,
  logoUrl,
  primaryColor,
  subscriptionPlan,
  status,
  showAvatar = true,
  className,
}: CompanyBadgeProps) {
  return (
    <div className={cn("flex min-w-0 items-start gap-3", className)}>
      {showAvatar && (
        <CompanyAvatar
          tradeName={tradeName}
          logoUrl={logoUrl}
          primaryColor={primaryColor}
          size="md"
        />
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-semibold text-foreground">{tradeName}</p>
        {legalName && (
          <p className="truncate text-xs text-muted-foreground">{legalName}</p>
        )}
        {(subscriptionPlan || status) && (
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {status && (
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                  COMPANY_STATUS_BADGE_CLASS[status] ?? "bg-muted text-muted-foreground border-border",
                )}
              >
                {getCompanyStatusLabel(status)}
              </span>
            )}
            {subscriptionPlan && (
              <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {getCompanyPlanLabel(subscriptionPlan)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
