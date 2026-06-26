import { useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { InspectionStatus } from "@/lib/enums";
import type { InspectionFilters } from "@/services/inspection-service";
import { SearchInput } from "@/components/shared/search-input";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VistoriaFiltersProps = {
  filters: InspectionFilters;
  onChange: (filters: InspectionFilters) => void;
};

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: InspectionStatus.DRAFT, label: "Rascunho" },
  { value: InspectionStatus.COMPLETED, label: "Concluída" },
  { value: InspectionStatus.ARCHIVED, label: "Arquivada" },
];

export function VistoriaFilters({ filters, onChange }: VistoriaFiltersProps) {
  const [open, setOpen] = useState(true);

  const update = (patch: Partial<InspectionFilters>) => {
    onChange({ ...filters, ...patch });
  };

  const clear = () => onChange({});

  const activeCount = [
    filters.plate,
    filters.search,
    filters.status,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  return (
    <div className="surface overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3.5 text-left sm:px-5 lg:pointer-events-none lg:cursor-default"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold">Filtros</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform lg:hidden", open && "rotate-180")}
        />
      </button>

      <div className={cn("border-t border-border/60 px-4 pb-4 sm:px-5 sm:pb-5", !open && "hidden lg:block")}>
        <div className="grid gap-4 pt-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="sm:col-span-2 xl:col-span-2">
            <Label htmlFor="filter-search" className="mb-2 block">
              Busca geral
            </Label>
            <SearchInput
              id="filter-search"
              value={filters.search ?? ""}
              onChange={(search) => update({ search: search || undefined })}
              placeholder="Placa, cliente, marca, modelo..."
              aria-label="Buscar vistorias"
            />
          </div>

          <div className="sm:col-span-2 xl:col-span-4">
            <Label className="mb-2 block">Status</Label>
            <div
              className="grid grid-cols-2 gap-1.5 rounded-xl border border-border/60 bg-muted/30 p-1.5 sm:flex sm:flex-wrap sm:gap-2 sm:border-0 sm:bg-transparent sm:p-0"
              role="group"
              aria-label="Filtrar por status"
            >
              {STATUS_OPTIONS.map((opt) => {
                const isActive = (filters.status ?? "") === opt.value;

                return (
                  <button
                    key={opt.value || "all"}
                    type="button"
                    onClick={() =>
                      update({
                        status: (opt.value || undefined) as InspectionFilters["status"],
                      })
                    }
                    className={cn(
                      "touch-target rounded-lg px-3 py-2.5 text-xs font-semibold transition-all sm:rounded-full sm:py-1.5",
                      isActive
                        ? "gradient-primary text-primary-foreground shadow-glow"
                        : "bg-card text-muted-foreground hover:bg-muted/60 sm:border sm:border-border sm:hover:border-primary/30 sm:hover:text-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="filter-plate" className="mb-2 block">
              Placa
            </Label>
            <SearchInput
              id="filter-plate"
              value={filters.plate ?? ""}
              onChange={(plate) => update({ plate: plate || undefined })}
              placeholder="ABC1D23"
              aria-label="Filtrar por placa"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:col-span-2 xl:col-span-1">
            <div>
              <Label htmlFor="filter-from" className="mb-2 block">
                De
              </Label>
              <Input
                id="filter-from"
                type="date"
                className="touch-target"
                value={filters.dateFrom ?? ""}
                onChange={(e) => update({ dateFrom: e.target.value || undefined })}
              />
            </div>
            <div>
              <Label htmlFor="filter-to" className="mb-2 block">
                Até
              </Label>
              <Input
                id="filter-to"
                type="date"
                className="touch-target"
                value={filters.dateTo ?? ""}
                onChange={(e) => update({ dateTo: e.target.value || undefined })}
              />
            </div>
          </div>
        </div>

        {activeCount > 0 && (
          <div className="mt-4 flex justify-stretch sm:justify-end">
            <Button type="button" variant="ghost" size="sm" className="w-full touch-target sm:w-auto" onClick={clear}>
              <X className="h-3.5 w-3.5" />
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
