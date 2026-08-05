import { useState } from "react";
import { Plus } from "lucide-react";
import { usePlatformCompanies, useOnboardCompany } from "@/modules/admin/platform/hooks/use-platform-admin";
import { OnboardCompanyDialog } from "@/modules/admin/platform/components/onboard-company-dialog";
import { CompanyBadge } from "@/core/tenant/components/company-badge";
import { Button } from "@/shared/ui/button";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { useToast } from "@/shared/hooks/use-toast";
import { formatUserFacingError } from "@/core/errors/user-facing-errors";
import type { OnboardCompanyInput } from "@/modules/admin/platform/schemas/platform-admin";

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
              <CompanyBadge
                tradeName={company.trade_name}
                legalName={company.legal_name}
                logoUrl={company.logo_url}
                primaryColor={company.primary_color}
                subscriptionPlan={company.subscription_plan}
                status={company.status}
              />

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
