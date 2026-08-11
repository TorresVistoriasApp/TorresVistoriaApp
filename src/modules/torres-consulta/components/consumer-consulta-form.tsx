import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";
import { maskChassis, maskPlate } from "@/shared/lib/masks";
import { PRICING_PLANS } from "@/modules/torres-consulta/components/landing/pricing-carousel";
import {
  getConsumerPlanCredits,
  type ConsumerPlanName,
} from "@/modules/torres-consulta/domain/consumer-plan-catalog";
import {
  consumerConsultaFormSchema,
  toConsumerConsultaRequest,
  type ConsumerConsultaFormInput,
  type ConsumerConsultaRequestInput,
} from "@/modules/torres-consulta/schemas/consumer-consulta";

interface ConsumerConsultaFormProps {
  onSubmit: (input: ConsumerConsultaRequestInput) => Promise<void> | void;
  submitting?: boolean;
  availableCredits?: number | null;
  /** Quando false, não exige saldo (integração pendente). */
  enforceCredits?: boolean;
}

const SEARCH_MODES = [
  { id: "plate", label: "Por placa" },
  { id: "chassis", label: "Por chassi" },
] as const;

export function ConsumerConsultaForm({
  onSubmit,
  submitting,
  availableCredits,
  enforceCredits = true,
}: ConsumerConsultaFormProps) {
  const [searchBy, setSearchBy] = useState<"plate" | "chassis">("plate");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ConsumerConsultaFormInput>({
    resolver: zodResolver(consumerConsultaFormSchema),
    defaultValues: {
      searchBy: "plate",
      plate: "",
      chassis: "",
      planName: "Completo" as ConsumerPlanName,
    },
  });

  const selectedPlan = watch("planName");
  const cost = getConsumerPlanCredits(selectedPlan);
  const insufficientCredits =
    enforceCredits &&
    availableCredits !== null &&
    availableCredits !== undefined &&
    availableCredits < cost;

  const switchMode = (mode: "plate" | "chassis") => {
    setSearchBy(mode);
    setValue("searchBy", mode);
    setValue(mode === "plate" ? "chassis" : "plate", "");
  };

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(toConsumerConsultaRequest(data)))}
      className="space-y-6"
    >
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
            <Label htmlFor="consumer-consulta-plate">Placa</Label>
            <Controller
              control={control}
              name="plate"
              render={({ field }) => (
                <Input
                  id="consumer-consulta-plate"
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
            <Label htmlFor="consumer-consulta-chassis">Chassi</Label>
            <Controller
              control={control}
              name="chassis"
              render={({ field }) => (
                <Input
                  id="consumer-consulta-chassis"
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
        <Label>Plano</Label>
        <div className="grid gap-3 sm:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <button
              key={plan.name}
              type="button"
              onClick={() => setValue("planName", plan.name as ConsumerPlanName)}
              className={cn(
                "rounded-xl border px-4 py-3 text-left transition-colors",
                selectedPlan === plan.name
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border hover:border-primary/40",
              )}
            >
              <p className="font-semibold">{plan.name}</p>
              <p className="text-xs text-muted-foreground">
                {getConsumerPlanCredits(plan.name as ConsumerPlanName)} crédito(s)
              </p>
            </button>
          ))}
        </div>
        {errors.planName && <p className="text-sm text-destructive">{errors.planName.message}</p>}
      </div>

      {enforceCredits && availableCredits !== null && availableCredits !== undefined && (
        <p className="text-sm text-muted-foreground">
          Saldo disponível: <span className="font-semibold text-foreground">{availableCredits}</span>
          {" · "}
          Esta consulta usa <span className="font-semibold text-foreground">{cost}</span> crédito(s).
        </p>
      )}

      <Button type="submit" disabled={submitting || insufficientCredits} className="w-full sm:w-auto">
        <Search className="h-4 w-4" />
        Solicitar consulta
      </Button>

      {insufficientCredits && (
        <p className="text-sm text-destructive">
          Créditos insuficientes para o plano selecionado.
        </p>
      )}
    </form>
  );
}
