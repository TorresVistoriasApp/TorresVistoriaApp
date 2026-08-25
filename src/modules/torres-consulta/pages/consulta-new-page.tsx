import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { History } from "lucide-react";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { ROUTES } from "@/config/routes";
import { getErrorMessage } from "@/core/errors/app-error";
import { ConsultaForm } from "@/modules/torres-consulta/components/consulta-form";
import { CreditBalanceCard } from "@/modules/torres-consulta/components/credit-balance-card";
import { IntegrationPendingNotice } from "@/modules/torres-consulta/components/integration-pending-notice";
import { useCreditBalance } from "@/modules/torres-consulta/hooks/use-credit-balance";
import { useRequestConsulta } from "@/modules/torres-consulta/hooks/use-consultas";
import { isConsultaAvailable } from "@/modules/torres-consulta/services/consulta-service";
import type { ConsultaRequestInput } from "@/modules/torres-consulta/schemas/consulta";
import { ConsultaFeatureGate } from "@/modules/torres-consulta/components/consulta-feature-gate";

export function ConsultaNewPage() {
  const navigate = useNavigate();
  const available = isConsultaAvailable();
  const { data: balance } = useCreditBalance();
  const requestConsulta = useRequestConsulta();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (input: ConsultaRequestInput) => {
    setError(null);
    try {
      const consulta = await requestConsulta.mutateAsync(input);
      navigate(ROUTES.consultaDetail(consulta.id));
    } catch (cause) {
      setError(getErrorMessage(cause));
    }
  };

  return (
    <ConsultaFeatureGate>
      <div className="space-y-6">
        <PageHeader
          badge="Torres Consulta"
          title="Nova consulta"
          description="Consulte a situação de um veículo por placa ou chassi."
          actions={
            <Button variant="outline" asChild>
              <Link to={ROUTES.consultaHistory}>
                <History className="h-4 w-4" />
                Histórico
              </Link>
            </Button>
          }
        />

        {available ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
            <Card>
              <CardContent>
                <ConsultaForm
                  onSubmit={handleSubmit}
                  submitting={requestConsulta.isPending}
                  availableCredits={balance?.available ?? null}
                />
                {error && (
                  <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                    {error}
                  </p>
                )}
              </CardContent>
            </Card>
            <CreditBalanceCard />
          </div>
        ) : (
          <IntegrationPendingNotice />
        )}
      </div>
    </ConsultaFeatureGate>
  );
}
