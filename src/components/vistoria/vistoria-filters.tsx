import { InspectionStatus } from "@/lib/enums";
import type { InspectionFilters } from "@/services/inspection-service";
import { SearchInput } from "@/components/shared/search-input";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type VistoriaFiltersProps = {
  filters: InspectionFilters;
  onChange: (filters: InspectionFilters) => void;
};

const STATUS_OPTIONS = [
  { value: "", label: "Todos os status" },
  { value: InspectionStatus.DRAFT, label: "Rascunho" },
  { value: InspectionStatus.COMPLETED, label: "Concluída" },
  { value: InspectionStatus.ARCHIVED, label: "Arquivada" },
];

export function VistoriaFilters({ filters, onChange }: VistoriaFiltersProps) {
  const update = (patch: Partial<InspectionFilters>) => {
    onChange({ ...filters, ...patch });
  };

  const clear = () => onChange({});

  const hasActive =
    Boolean(filters.plate) ||
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  return (
    <div className="grid gap-4 rounded-lg border border-border bg-background p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="sm:col-span-2">
        <Label htmlFor="filter-search" className="mb-2 block text-xs">
          Busca
        </Label>
        <SearchInput
          id="filter-search"
          value={filters.search ?? ""}
          onChange={(search) => update({ search: search || undefined })}
          placeholder="Placa, cliente, marca..."
          aria-label="Buscar vistorias"
        />
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="filter-plate" className="mb-2 block text-xs">
          Placa
        </Label>
        <SearchInput
          id="filter-plate"
          value={filters.plate ?? ""}
          onChange={(plate) => update({ plate: plate || undefined })}
          placeholder="Ex: ABC1D23"
          aria-label="Filtrar por placa"
        />
      </div>

      <div>
        <Label htmlFor="filter-status" className="mb-2 block text-xs">
          Status
        </Label>
        <select
          id="filter-status"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={filters.status ?? ""}
          onChange={(e) =>
            update({
              status: (e.target.value || undefined) as InspectionFilters["status"],
            })
          }
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="filter-from" className="mb-2 block text-xs">
          De
        </Label>
        <Input
          id="filter-from"
          type="date"
          value={filters.dateFrom ?? ""}
          onChange={(e) => update({ dateFrom: e.target.value || undefined })}
        />
      </div>

      <div>
        <Label htmlFor="filter-to" className="mb-2 block text-xs">
          Até
        </Label>
        <Input
          id="filter-to"
          type="date"
          value={filters.dateTo ?? ""}
          onChange={(e) => update({ dateTo: e.target.value || undefined })}
        />
      </div>

      {hasActive && (
        <div className="flex items-end sm:col-span-2 lg:col-span-5">
          <Button type="button" variant="outline" size="sm" onClick={clear}>
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
