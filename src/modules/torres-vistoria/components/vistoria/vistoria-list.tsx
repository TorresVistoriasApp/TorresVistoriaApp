import type { Inspection } from "@/modules/torres-vistoria/services/inspection-service";
import { VistoriaCard } from "@/modules/torres-vistoria/components/vistoria/vistoria-card";
import { EmptyState } from "@/shared/components/empty-state";
import { LoadingSpinner } from "@/shared/components/loading-spinner";

export function VistoriaList({
  inspections,
  loading,
}: {
  inspections: Inspection[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (inspections.length === 0) {
    return (
      <EmptyState
        title="Nenhuma vistoria"
        description="Crie a primeira vistoria cautelar."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {inspections.map((inspection) => (
        <VistoriaCard key={inspection.id} inspection={inspection} />
      ))}
    </div>
  );
}
