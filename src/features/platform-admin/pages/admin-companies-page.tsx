import { useState } from "react";
import { Building2, Plus } from "lucide-react";
import { usePlatformCompanies, useOnboardCompany } from "@/hooks/use-platform-admin";
import { OnboardCompanyDialog } from "@/features/platform-admin/components/onboard-company-dialog";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { formatUserFacingError } from "@/lib/user-facing-errors";
import type { OnboardCompanyInput } from "@/schemas/platform-admin";

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

const STATUS_LABELS: Record<string, string> = {
  trial: "Em teste",
  active: "Ativa",
  suspended: "Suspensa",
  canceled: "Cancelada",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  trial: "bg-amber-500/10 text-amber-600",
  active: "bg-emerald-500/10 text-emerald-600",
  suspended: "bg-destructive/10 text-destructive",
  canceled: "bg-muted text-muted-foreground",
};

export function AdminCompaniesPage() {
  const { data: companies = [], isLoading } = usePlatformCompanies();
  const onboardCompany = useOnboardCompany();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);

  const handleCreate = async (data: OnboardCompanyInput) => {
    try {
      await onboardCompany.mutateAsync(data);
      toast({ title: "Empresa criada com sucesso", type: "success" });
    } catch (err) {
      toast({
        title: "Não foi possível criar a empresa",
        description: formatUserFacingError(err instanceof Error ? err.message : ""),
        type: "error",
      });
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Empresas</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Cada empresa é um tenant isolado por Row Level Security. Nenhum dado é compartilhado
            entre elas.
          </p>
        </div>
        <Button className="touch-target shrink-0" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova empresa
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : companies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma empresa cadastrada ainda.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <div
              key={company.id}
              className="space-y-3 rounded-2xl border border-border/60 bg-card p-4 shadow-soft"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{company.trade_name}</p>
                  {company.legal_name && (
                    <p className="truncate text-xs text-muted-foreground">{company.legal_name}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={`rounded-full px-2.5 py-1 font-medium ${STATUS_BADGE_CLASS[company.status] ?? "bg-muted text-muted-foreground"}`}
                >
                  {STATUS_LABELS[company.status] ?? company.status}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                  {PLAN_LABELS[company.subscription_plan] ?? company.subscription_plan}
                </span>
              </div>

              {company.email && (
                <p className="truncate text-sm text-muted-foreground">{company.email}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <OnboardCompanyDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} />
    </div>
  );
}
