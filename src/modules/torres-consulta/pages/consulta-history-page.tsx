import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/ui/button";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { ROUTES } from "@/config/routes";
import { ConsultaHistoryList } from "@/modules/torres-consulta/components/consulta-history-list";
import { useConsultas } from "@/modules/torres-consulta/hooks/use-consultas";
import { ConsultaFeatureGate } from "@/modules/torres-consulta/components/consulta-feature-gate";

export function ConsultaHistoryPage() {
  const { data: consultas, isLoading } = useConsultas();

  return (
    <ConsultaFeatureGate>
      <div className="space-y-6">
        <PageHeader
          badge="Torres Consulta"
          title="Histórico"
          description="Todas as consultas veiculares realizadas pela empresa."
          actions={
            <Button asChild>
              <Link to={ROUTES.consultaNew}>
                <Plus className="h-4 w-4" />
                Nova consulta
              </Link>
            </Button>
          }
        />

        {isLoading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <ConsultaHistoryList consultas={consultas ?? []} />
        )}
      </div>
    </ConsultaFeatureGate>
  );
}
