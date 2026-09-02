import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";
import { maskChassis, maskPlate } from "@/shared/lib/masks";
import { VehicleQueryType } from "@/core/integrations/ports/vehicle-lookup";
import { QueryTypeSelector } from "@/modules/torres-consulta/components/query-type-selector";
import {
  consultaFormSchema,
  toConsultaRequest,
  type ConsultaFormInput,
  type ConsultaRequestInput,
} from "@/modules/torres-consulta/schemas/consulta";

interface ConsultaFormProps {
  onSubmit: (input: ConsultaRequestInput) => Promise<void> | void;
  submitting?: boolean;
}

const SEARCH_MODES = [
  { id: "plate", label: "Por placa" },
  { id: "chassis", label: "Por chassi" },
] as const;

export function ConsultaForm({ onSubmit, submitting }: ConsultaFormProps) {
  const [searchBy, setSearchBy] = useState<"plate" | "chassis">("plate");

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ConsultaFormInput>({
    resolver: zodResolver(consultaFormSchema),
    defaultValues: { searchBy: "plate", plate: "", chassis: "", type: VehicleQueryType.BASIC },
  });

  const switchMode = (mode: "plate" | "chassis") => {
    setSearchBy(mode);
    setValue("searchBy", mode);
    // Limpa o campo oculto para não validar um identificador que o usuário abandonou.
    setValue(mode === "plate" ? "chassis" : "plate", "");
  };

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(toConsultaRequest(data)))} className="space-y-6">
      <div className="space-y-3">
        <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1">
          {SEARCH_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => switchMode(mode.id)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                searchBy === mode.id
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {searchBy === "plate" ? (
          <div className="space-y-2">
            <Label htmlFor="consulta-plate">Placa</Label>
            <Controller
              control={control}
              name="plate"
              render={({ field }) => (
                <Input
                  id="consulta-plate"
                  placeholder="ABC1D23"
                  autoComplete="off"
                  className="font-mono uppercase tracking-widest"
                  value={field.value ?? ""}
                  onChange={(event) => field.onChange(maskPlate(event.target.value))}
                />
              )}
            />
            {errors.plate && <p className="text-sm text-destructive">{errors.plate.message}</p>}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="consulta-chassis">Chassi</Label>
            <Controller
              control={control}
              name="chassis"
              render={({ field }) => (
                <Input
                  id="consulta-chassis"
                  placeholder="9BWZZZ377VT004251"
                  autoComplete="off"
                  className="font-mono uppercase tracking-wider"
                  value={field.value ?? ""}
                  onChange={(event) => field.onChange(maskChassis(event.target.value))}
                />
              )}
            />
            {errors.chassis && <p className="text-sm text-destructive">{errors.chassis.message}</p>}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label>Tipo de consulta</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <QueryTypeSelector value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <Button type="submit" size="lg" disabled={submitting}>
        <Search className="h-4 w-4" />
        {submitting ? "Consultando..." : "Consultar"}
      </Button>
    </form>
  );
}
