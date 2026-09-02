import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { getErrorMessage } from "@/core/errors/app-error";
import { ConsumerConsultaForm } from "@/modules/torres-consulta/components/consumer-consulta-form";
import { ConsumerPageHeader } from "@/modules/torres-consulta/components/consumer-app/consumer-page-header";
import {
  ConsumerSurface,
  ConsumerSurfaceHeader,
} from "@/modules/torres-consulta/components/consumer-app/consumer-surface";
import { IntegrationPendingNotice } from "@/modules/torres-consulta/components/integration-pending-notice";
import { useRequestConsumerConsulta } from "@/modules/torres-consulta/hooks/use-consumer-consultas";
import { isConsultaAvailable } from "@/modules/torres-consulta/domain/services/consulta-availability";
import {
  CONSUMER_PLAN_NAMES,
  type ConsumerPlanName,
} from "@/modules/torres-consulta/domain/consumer-plan-catalog";

function resolvePlanFromQuery(value: string | null): ConsumerPlanName {
  if (value && CONSUMER_PLAN_NAMES.includes(value as ConsumerPlanName)) {
    return value as ConsumerPlanName;
  }
  return "Completo";
}

export function ConsultaAppNovaConsultaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const integrationAvailable = isConsultaAvailable();
  const requestConsulta = useRequestConsumerConsulta();
  const [error, setError] = useState<string | null>(null);

  const defaultPlanName = useMemo(
    () => resolvePlanFromQuery(searchParams.get("plano")),
    [searchParams],
  );

  const handleSubmit = async (input: Parameters<typeof requestConsulta.mutateAsync>[0]) => {
    setError(null);
    try {
      const consulta = await requestConsulta.mutateAsync(input);
      navigate(ROUTES.consultaAppConsultaDetail(consulta.id));
    } catch (cause) {
      setError(getErrorMessage(cause));
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 md:max-w-2xl">
      <ConsumerPageHeader
        title="Nova consulta"
        subtitle="Pagamento avulso · escolha o plano ideal"
        backTo={ROUTES.consultaApp}
        backLabel="Início"
        badge="Avulsa"
      />

      <ConsumerSurface padding="none">
        <ConsumerSurfaceHeader
          icon={Search}
          title="Consultar veículo"
          description={
            integrationAvailable
              ? "Informe placa ou chassi e finalize o pagamento."
              : "Registre agora — o relatório libera quando a integração estiver ativa."
          }
        />

        <div className="p-5 sm:p-6">
          <ConsumerConsultaForm
            onSubmit={handleSubmit}
            submitting={requestConsulta.isPending}
            defaultPlanName={defaultPlanName}
          />
          {error && (
            <p className="mt-4 rounded-lg border border-destructive-border bg-destructive-subtle px-3 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </ConsumerSurface>

      <div className="flex items-start gap-3 rounded-xl border border-success-border bg-success-subtle px-4 py-3.5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Compra avulsa por consulta, no cartão ou PIX.
        </p>
      </div>

      {!integrationAvailable && <IntegrationPendingNotice />}
    </div>
  );
}
