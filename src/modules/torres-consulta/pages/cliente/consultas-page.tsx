import { Link } from "react-router-dom";
import { FileSearch, Plus } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/components/empty-state";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { ConsumerConsultaListItem } from "@/modules/torres-consulta/components/consumer-app/consumer-consulta-list-item";
import { ConsumerPageHeader } from "@/modules/torres-consulta/components/consumer-app/consumer-page-header";
import { ConsumerSurface } from "@/modules/torres-consulta/components/consumer-app/consumer-surface";
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
        <ConsumerSurface className="py-10">
          <EmptyState
            title="Nenhuma consulta realizada"
            description="Realize sua primeira consulta veicular para ver o histórico aqui."
          />
          <div className="mt-6 text-center">
            <Button asChild className="rounded-full">
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <ConsumerPageHeader
          title="Minhas consultas"
          subtitle="Histórico completo de consultas veiculares realizadas."
          badge={`${consultas.length} total`}
        />
        <Button asChild size="sm" className="hidden rounded-full sm:inline-flex">
          <Link to={ROUTES.consultaAppNovaConsulta}>
            <Plus className="h-4 w-4" />
            Nova consulta
          </Link>
        </Button>
      </div>

      <ConsumerSurface padding="none">
        <div className="flex items-center gap-3 border-b border-border/40 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileSearch className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">Todas as consultas</p>
            <p className="text-xs text-muted-foreground">Toque em um item para ver detalhes</p>
          </div>
        </div>
        <div className="divide-y divide-border/40">
          {consultas.map((consulta) => (
            <ConsumerConsultaListItem key={consulta.id} consulta={consulta} variant="flat" />
          ))}
        </div>
      </ConsumerSurface>
    </div>
  );
}
