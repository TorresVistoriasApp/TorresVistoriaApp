import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { getErrorMessage } from "@/core/errors/app-error";
import { ConsumerConsultaForm } from "@/modules/torres-consulta/components/consumer-consulta-form";
import { IntegrationPendingNotice } from "@/modules/torres-consulta/components/integration-pending-notice";
import { useRequestConsumerConsulta } from "@/modules/torres-consulta/hooks/use-consumer-consultas";
import { isConsultaAvailable } from "@/modules/torres-consulta/domain/services/consulta-availability";
import {
  CONSUMER_PLAN_NAMES,
  type ConsumerPlanName,
} from "@/modules/torres-consulta/domain/consumer-plan-catalog";
import { Button } from "@/shared/ui/button";

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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="shrink-0 rounded-xl" asChild>
          <Link to={ROUTES.consultaApp} aria-label="Voltar ao início">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
            Nova consulta
          </h1>
          <p className="text-sm text-muted-foreground">Pagamento avulso · escolha o plano ideal</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 shadow-[0_16px_48px_rgb(15_23_42_/_0.06)] backdrop-blur-sm">
        <div className="border-b border-border/50 bg-gradient-to-r from-orange-50/80 to-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Search className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">Consultar veículo</p>
              <p className="text-xs text-muted-foreground">
                {integrationAvailable
                  ? "Informe placa ou chassi e finalize o pagamento."
                  : "Registre agora — o relatório libera quando a integração estiver ativa."}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <ConsumerConsultaForm
            onSubmit={handleSubmit}
            submitting={requestConsulta.isPending}
            defaultPlanName={defaultPlanName}
          />
          {error && (
            <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3.5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Compra avulsa por consulta. Pacotes com créditos são exclusivos para vistoriadores na Torres
          Vistoria — em breve.
        </p>
      </div>

      {!integrationAvailable && <IntegrationPendingNotice />}
    </div>
  );
}
