export const COMPANY_PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

export const COMPANY_STATUS_LABELS: Record<string, string> = {
  trial: "Em teste",
  active: "Ativa",
  suspended: "Suspensa",
  canceled: "Cancelada",
};

export const COMPANY_STATUS_BADGE_CLASS: Record<string, string> = {
  trial: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  active: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
  canceled: "bg-muted text-muted-foreground border-border",
};

export function getCompanyInitials(tradeName?: string | null): string {
  if (!tradeName?.trim()) return "EM";
  return tradeName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function getCompanyPlanLabel(plan?: string | null): string {
  if (!plan) return "—";
  return COMPANY_PLAN_LABELS[plan] ?? plan;
}

export function getCompanyStatusLabel(status?: string | null): string {
  if (!status) return "—";
  return COMPANY_STATUS_LABELS[status] ?? status;
}
