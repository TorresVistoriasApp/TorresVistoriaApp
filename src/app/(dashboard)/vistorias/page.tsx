import { useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useInspections } from "@/hooks/use-inspections";
import { VistoriaList } from "@/components/vistoria/vistoria-list";
import { VistoriaFilters } from "@/components/vistoria/vistoria-filters";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import type { InspectionFilters } from "@/services/inspection-service";

export function Page() {
  const [filters, setFilters] = useState<InspectionFilters>({});
  const { data = [], isLoading } = useInspections(filters);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Vistorias"
        description="Histórico e gestão de laudos cautelares"
        testId="vistorias-heading"
        actions={
          <div className="w-full sm:w-auto">
            <Button asChild className="touch-target w-full sm:w-auto" size="lg">
              <Link to={ROUTES.inspectionNew}>
                <Plus className="h-4 w-4" />
                Nova vistoria
              </Link>
            </Button>
          </div>
        }
      />

      <VistoriaFilters filters={filters} onChange={setFilters} />
      <VistoriaList inspections={data} loading={isLoading} />
    </div>
  );
}
