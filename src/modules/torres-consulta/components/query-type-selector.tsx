import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { QUERY_CATALOG } from "@/modules/torres-consulta/domain/query-catalog";
import type { VehicleQueryType } from "@/core/integrations/ports/vehicle-lookup";

interface QueryTypeSelectorProps {
  value: VehicleQueryType;
  onChange: (type: VehicleQueryType) => void;
}

export function QueryTypeSelector({ value, onChange }: QueryTypeSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {QUERY_CATALOG.map((item) => {
        const selected = item.type === value;
        return (
          <button
            key={item.type}
            type="button"
            onClick={() => onChange(item.type)}
            aria-pressed={selected}
            className={cn(
              "flex flex-col gap-2 rounded-xl border p-4 text-left transition-all",
              selected
                ? "border-primary/50 bg-primary/5 shadow-glow"
                : "border-border bg-card hover:border-primary/30 hover:bg-primary/5",
              item.highlighted && !selected && "border-primary/25",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
              {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p>
          </button>
        );
      })}
    </div>
  );
}
