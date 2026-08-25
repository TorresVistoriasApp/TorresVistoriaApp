import { Link } from "react-router-dom";
import { FileSearch, Plus } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { ConsumerConsultaListItem } from "@/modules/torres-consulta/components/consumer-app/consumer-consulta-list-item";
import { ConsumerPageHeader } from "@/modules/torres-consulta/components/consumer-app/consumer-page-header";
import {
  ConsumerSurface,
  ConsumerSurfaceHeader,
} from "@/modules/torres-consulta/components/consumer-app/consumer-surface";
import { useConsumerConsultas } from "@/modules/torres-consulta/hooks/use-consumer-consultas";

export function ClienteConsultasPage() {
  const { data: consultas, isLoading } = useConsumerConsultas();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!consultas?.length) {
    return (
      <div className="space-y-6">
        <ConsumerPageHeader
          title="Minhas consultas"
          subtitle="Histórico completo de consultas veiculares realizadas."
        />
        <ConsumerSurface className="border-dashed px-6 py-10 text-center">
          <div className="ui-icon-box mx-auto h-12 w-12">
            <FileSearch className="h-5 w-5" aria-hidden />
          </div>
          <p className="mt-4 text-[17px] font-bold text-foreground">Nenhuma consulta realizada</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Realize sua primeira consulta veicular para ver o histórico aqui.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link to={ROUTES.consultaAppNovaConsulta}>
                <Plus className="h-4 w-4" />
                Nova consulta
              </Link>
            </Button>
          </div>
        </ConsumerSurface>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConsumerPageHeader
        title="Minhas consultas"
        subtitle="Histórico completo de consultas veiculares realizadas."
        badge={`${consultas.length} total`}
        actions={
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to={ROUTES.consultaAppNovaConsulta}>
              <Plus className="h-4 w-4" />
              Nova consulta
            </Link>
          </Button>
        }
      />

      <ConsumerSurface padding="none">
        <ConsumerSurfaceHeader
          icon={FileSearch}
          title="Todas as consultas"
          description="Toque em um item para ver detalhes"
        />
        <div className="divide-y divide-border">
          {consultas.map((consulta) => (
            <ConsumerConsultaListItem key={consulta.id} consulta={consulta} variant="flat" />
          ))}
        </div>
      </ConsumerSurface>
    </div>
  );
}
