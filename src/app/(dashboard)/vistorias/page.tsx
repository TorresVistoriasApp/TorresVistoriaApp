import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useInspections } from "@/hooks/use-inspections";
import { VistoriaList } from "@/components/vistoria/vistoria-list";
import { VistoriaFilters } from "@/components/vistoria/vistoria-filters";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import type { InspectionFilters } from "@/services/inspection-service";

const PAGE_SIZE = 25;

export function Page() {
  const [filters, setFilters] = useState<InspectionFilters>({});
  const [page, setPage] = useState(0);

  const queryFilters = useMemo(
    () => ({
      ...filters,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }),
    [filters, page],
  );

  const { data, isLoading } = useInspections(queryFilters);
  const rows = data?.data ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-w-0 space-y-8">
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

      <VistoriaFilters
        filters={filters}
        onChange={(next) => {
          setPage(0);
          setFilters(next);
        }}
      />
      <VistoriaList inspections={rows} loading={isLoading} />

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            Página {page + 1} de {totalPages} · {total} vistorias
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
