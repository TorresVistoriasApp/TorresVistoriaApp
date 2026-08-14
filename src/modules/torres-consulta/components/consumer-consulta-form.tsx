import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";
import { maskChassis, maskPlate } from "@/shared/lib/masks";
import { PRICING_PLANS } from "@/modules/torres-consulta/components/landing/pricing-carousel";
import {
  getConsumerPlanPriceLabel,
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
  defaultPlanName?: ConsumerPlanName;
}

const SEARCH_MODES = [
  { id: "plate", label: "Por placa" },
  { id: "chassis", label: "Por chassi" },
] as const;

export function ConsumerConsultaForm({
  onSubmit,
  submitting,
  defaultPlanName = "Completo",
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
      planName: defaultPlanName,
    },
  });

  const selectedPlan = watch("planName");
  const selectedPlanData = PRICING_PLANS.find((plan) => plan.name === selectedPlan);
  const priceLabel = getConsumerPlanPriceLabel(selectedPlan);

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
        <Label>Escolha o plano</Label>
        <div className="grid gap-3 sm:grid-cols-3">
          {PRICING_PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.name;
            return (
              <button
                key={plan.name}
                type="button"
                onClick={() => setValue("planName", plan.name as ConsumerPlanName)}
                className={cn(
                  "relative rounded-2xl border px-4 py-3.5 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                    : "border-border hover:border-primary/30",
                  plan.highlighted && !isSelected && "border-primary/20",
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-2 right-3 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase text-primary-foreground">
                    Top
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <p className="font-semibold">{plan.name}</p>
                </div>
                <p className="mt-1 text-sm font-bold text-foreground">R$ {plan.price}</p>
                <p className="text-[11px] text-muted-foreground">pagamento avulso</p>
              </button>
            );
          })}
        </div>
        {errors.planName && <p className="text-sm text-destructive">{errors.planName.message}</p>}
      </div>

      <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CreditCard className="h-4 w-4 shrink-0 text-primary" />
          Você pagará <span className="font-bold text-foreground">{priceLabel}</span> por esta
          consulta
          {selectedPlanData?.originalPrice && (
            <span className="text-xs line-through">R$ {selectedPlanData.originalPrice}</span>
          )}
          . Aceitamos cartão e PIX.
        </p>
      </div>

      <Button type="submit" disabled={submitting} className="h-12 w-full rounded-2xl text-base font-bold sm:w-auto">
        <Search className="h-4 w-4" />
        {submitting ? "Processando..." : `Consultar por ${priceLabel}`}
      </Button>
    </form>
  );
}
