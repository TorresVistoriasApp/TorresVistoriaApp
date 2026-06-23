import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { financialEntrySchema, type FinancialEntryInput } from "@/schemas/financial";
import { FinancialEntryType } from "@/lib/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FinancialEntryForm({
  defaultType,
  onSubmit,
}: {
  defaultType?: FinancialEntryInput["entry_type"];
  onSubmit: (data: FinancialEntryInput) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FinancialEntryInput>({
    resolver: zodResolver(financialEntrySchema),
    defaultValues: {
      entry_type: defaultType ?? FinancialEntryType.RECEITA,
      entry_date: new Date().toISOString().slice(0, 10),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-border p-4">
      <div>
        <Label>Tipo</Label>
        <select
          {...register("entry_type")}
          className="mt-1 flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
        >
          {Object.values(FinancialEntryType).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <Label>Descrição</Label>
        <Input {...register("description")} />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>
      <div>
        <Label>Valor (R$)</Label>
        <Input type="number" step="0.01" {...register("amount")} />
        {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
      </div>
      <div>
        <Label>Data</Label>
        <Input type="date" {...register("entry_date")} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Adicionar lançamento"}
      </Button>
    </form>
  );
}
