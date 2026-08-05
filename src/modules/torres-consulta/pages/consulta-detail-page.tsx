import { useParams } from "react-router-dom";
import { PageHeader } from "@/shared/components/page-header";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { EmptyState } from "@/shared/components/empty-state";
import { MobileBackButton } from "@/shared/components/mobile-back-button";
import { ROUTES } from "@/config/routes";
import { ConsultaResult } from "@/modules/torres-consulta/components/consulta-result";
import { useConsulta } from "@/modules/torres-consulta/hooks/use-consultas";
import { ConsultaStatus } from "@/modules/torres-consulta/types/consulta";
import { ConsultaFeatureGate } from "@/modules/torres-consulta/components/consulta-feature-gate";

export function ConsultaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: consulta, isLoading } = useConsulta(id);

  if (isLoading) {
    return (
      <ConsultaFeatureGate>
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </ConsultaFeatureGate>
    );
  }

  if (!consulta) {
    return (
      <ConsultaFeatureGate>
        <EmptyState
          title="Consulta não encontrada"
          description="Ela pode ter sido removida ou pertencer a outra empresa."
        />
      </ConsultaFeatureGate>
    );
  }

  return (
    <ConsultaFeatureGate>
      <div className="space-y-6">
        <MobileBackButton to={ROUTES.consultaHistory} label="Histórico" />
        <PageHeader badge="Torres Consulta" title="Resultado da consulta" />

        {consulta.status === ConsultaStatus.FAILED ? (
          <EmptyState
            title="A consulta não foi concluída"
            description={consulta.failureReason ?? "O provedor não retornou resultado."}
          />
        ) : (
          <ConsultaResult consulta={consulta} />
        )}
      </div>
    </ConsultaFeatureGate>
  );
}
