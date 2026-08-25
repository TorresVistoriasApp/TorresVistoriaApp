import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import { formatPlate } from "@/modules/torres-consulta/domain/value-objects";
import { getQueryLabel } from "@/modules/torres-consulta/domain/query-catalog";
import type { VehicleFinding } from "@/core/integrations/ports/vehicle-lookup";
import type { Consulta } from "@/modules/torres-consulta/domain/entities/consulta";

const SEVERITY_STYLES: Record<VehicleFinding["severity"], { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: "border-border/60 bg-muted/30 text-muted-foreground" },
  warning: { icon: AlertTriangle, className: "border-amber-500/30 bg-amber-500/5 text-amber-700" },
  critical: { icon: ShieldAlert, className: "border-destructive/30 bg-destructive/5 text-destructive" },
};

function Field({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

export function ConsultaResult({ consulta }: { consulta: Consulta }) {
  const { vehicle, findings } = consulta;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>
            {consulta.plate ? formatPlate(consulta.plate) : consulta.chassis}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{getQueryLabel(consulta.type)}</p>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Marca" value={vehicle?.brand ?? null} />
          <Field label="Modelo" value={vehicle?.model ?? null} />
          <Field label="Ano modelo" value={vehicle?.modelYear ?? null} />
          <Field label="Ano fabricação" value={vehicle?.manufactureYear ?? null} />
          <Field label="Cor" value={vehicle?.color ?? null} />
          <Field label="Combustível" value={vehicle?.fuel ?? null} />
          <Field label="Município" value={vehicle?.city ?? null} />
          <Field label="UF" value={vehicle?.state ?? null} />
        </CardContent>
      </Card>

      {findings.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold tracking-tight">Ocorrências encontradas</h2>
          {findings.map((finding, index) => {
            const style = SEVERITY_STYLES[finding.severity];
            const Icon = style.icon;
            return (
              <div
                key={`${finding.category}-${index}`}
                className={cn("flex gap-3 rounded-xl border p-4", style.className)}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold text-foreground">{finding.title}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {finding.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
