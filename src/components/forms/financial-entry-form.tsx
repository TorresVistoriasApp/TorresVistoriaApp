import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { financialEntrySchema, type FinancialEntryInput } from "@/schemas/financial";
import { FinancialEntryType } from "@/lib/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { maskCurrencyDecimal, parseCurrencyDecimal } from "@/lib/masks";
import { cn } from "@/lib/utils";

const ENTRY_TYPE_OPTIONS = [
  {
    value: FinancialEntryType.RECEITA,
    label: "Receita",
    active: "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/25",
    idle: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  },
  {
    value: FinancialEntryType.DESPESA,
    label: "Despesa",
    active: "bg-destructive text-white shadow-sm ring-2 ring-destructive/25",
    idle: "bg-red-50 text-destructive hover:bg-red-100",
  },
  {
    value: FinancialEntryType.CUSTO,
    label: "Custo",
    active: "bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/25",
    idle: "bg-amber-50 text-amber-800 hover:bg-amber-100",
  },
] as const;

function getDefaultValues(defaultType?: FinancialEntryInput["entry_type"]): FinancialEntryInput {
  return {
    entry_type: defaultType ?? FinancialEntryType.RECEITA,
    description: "",
    amount: 0,
    entry_date: new Date().toISOString().slice(0, 10),
  };
}

export function FinancialEntryForm({
  defaultType,
  onSubmit,
  variant = "page",
  open,
  onCancel,
}: {
  defaultType?: FinancialEntryInput["entry_type"];
  onSubmit: (data: FinancialEntryInput) => Promise<void>;
  variant?: "page" | "dialog";
  open?: boolean;
  onCancel?: () => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FinancialEntryInput>({
    resolver: zodResolver(financialEntrySchema),
    defaultValues: getDefaultValues(defaultType),
  });

  useEffect(() => {
    if (variant === "dialog" && open) {
      reset(getDefaultValues(defaultType));
    }
  }, [open, defaultType, reset, variant]);

  const showTypeSelector = !(variant === "page" && defaultType);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        "space-y-5",
        variant === "page" && "rounded-xl border border-border bg-card p-4 shadow-soft sm:p-6",
      )}
    >
      {showTypeSelector ? (
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Controller
            control={control}
            name="entry_type"
            render={({ field }) => (
              <div
                className="grid grid-cols-3 gap-2 rounded-xl border border-border/60 bg-muted/30 p-1"
                role="group"
                aria-label="Tipo de lançamento"
              >
                {ENTRY_TYPE_OPTIONS.map((option) => {
                  const isActive = field.value === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => field.onChange(option.value)}
                      className={cn(
                        "touch-target rounded-lg px-2 py-2.5 text-xs font-semibold transition-all sm:text-sm",
                        isActive ? option.active : option.idle,
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          />
          {errors.entry_type && (
            <p className="text-sm text-destructive">{errors.entry_type.message}</p>
          )}
        </div>
      ) : (
        <input type="hidden" {...register("entry_type")} />
      )}

      <div className="space-y-2">
        <Label htmlFor="financial-description">Descrição</Label>
        <Input
          id="financial-description"
          className="touch-target"
          placeholder="Ex.: Vistoria cautelar — cliente João Silva"
          autoComplete="off"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="financial-amount">Valor (R$)</Label>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <Input
                id="financial-amount"
                className="touch-target"
                inputMode="numeric"
                autoComplete="off"
                placeholder="R$ 0,00"
                value={
                  field.value > 0
                    ? maskCurrencyDecimal(String(Math.round(field.value * 100)))
                    : ""
                }
                onChange={(event) => {
                  const parsed = parseCurrencyDecimal(event.target.value);
                  field.onChange(parsed ?? 0);
                }}
                onBlur={field.onBlur}
              />
            )}
          />
          {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="financial-date">Data</Label>
          <Input
            id="financial-date"
            type="date"
            className="touch-target"
            {...register("entry_date")}
          />
          {errors.entry_date && (
            <p className="text-sm text-destructive">{errors.entry_date.message}</p>
          )}
        </div>
      </div>

      {variant === "dialog" ? (
        <DialogFooter className="sticky bottom-0 gap-3 border-t border-border/60 bg-card px-0 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-4 sm:static sm:border-0 sm:bg-transparent sm:pb-0">
          <Button
            type="button"
            variant="outline"
            className="touch-target w-full sm:w-auto"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="accent"
            className="touch-target w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Adicionar lançamento"
            )}
          </Button>
        </DialogFooter>
      ) : (
        <div className="flex justify-end pt-1">
          <Button type="submit" variant="accent" className="touch-target w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Adicionar lançamento"
            )}
          </Button>
        </div>
      )}
    </form>
  );
}
