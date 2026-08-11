import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { getErrorMessage } from "@/core/errors/app-error";
import { ConsumerConsultaForm } from "@/modules/torres-consulta/components/consumer-consulta-form";
import { IntegrationPendingNotice } from "@/modules/torres-consulta/components/integration-pending-notice";
import {
  useConsumerCreditBalance,
  useRequestConsumerConsulta,
} from "@/modules/torres-consulta/hooks/use-consumer-consultas";
import { isConsultaAvailable } from "@/modules/torres-consulta/domain/services/consulta-availability";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export function ConsultaAppNovaConsultaPage() {
  const navigate = useNavigate();
  const integrationAvailable = isConsultaAvailable();
  const { data: balance } = useConsumerCreditBalance();
  const requestConsulta = useRequestConsumerConsulta();
  const [error, setError] = useState<string | null>(null);

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Nova consulta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Informe a placa ou o chassi do veículo e escolha o plano da consulta.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-primary" />
              Consultar veículo
            </CardTitle>
            <CardDescription>
              {integrationAvailable
                ? "A consulta será registrada e processada com seu saldo de créditos."
                : "Você pode registrar a consulta agora; o resultado será liberado quando a integração estiver ativa."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConsumerConsultaForm
              onSubmit={handleSubmit}
              submitting={requestConsulta.isPending}
              availableCredits={balance?.available ?? null}
              enforceCredits={integrationAvailable}
            />
            {error && (
              <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                {error}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Saldo de créditos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black tracking-tight">{balance?.available ?? 0}</p>
            <p className="mt-1 text-sm text-muted-foreground">créditos disponíveis</p>
            {balance != null && balance.pending > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {balance.pending} crédito(s) pendente(s)
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {!integrationAvailable && <IntegrationPendingNotice />}

      <div className="text-center">
        <Button variant="outline" asChild>
          <Link to={ROUTES.consultaLanding}>Ver planos na página inicial</Link>
        </Button>
      </div>
    </div>
  );
}
