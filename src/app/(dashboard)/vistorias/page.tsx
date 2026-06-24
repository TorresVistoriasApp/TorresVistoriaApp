import { useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useInspections } from "@/hooks/use-inspections";
import { VistoriaList } from "@/components/vistoria/vistoria-list";
import { VistoriaFilters } from "@/components/vistoria/vistoria-filters";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import type { InspectionFilters } from "@/services/inspection-service";

export function Page() {
  const [filters, setFilters] = useState<InspectionFilters>({});
  const { data = [], isLoading } = useInspections(filters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
        <h1 className="text-2xl font-bold" data-testid="vistorias-heading">
          Vistorias
        </h1>
          <p className="text-sm text-muted-foreground">Histórico e gestão de laudos</p>
        </div>
        <Button asChild>
          <Link to={ROUTES.inspectionNew}>
            <Plus className="h-4 w-4" />
            Nova
          </Link>
        </Button>
      </div>

      <VistoriaFilters filters={filters} onChange={setFilters} />
      <VistoriaList inspections={data} loading={isLoading} />
    </div>
  );
}
