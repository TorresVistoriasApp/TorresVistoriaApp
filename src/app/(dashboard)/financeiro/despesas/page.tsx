import { RequirePermission } from "@/app/require-role";
import { FinancialEntryForm } from "@/components/forms/financial-entry-form";
import { useCreateFinancialEntry } from "@/hooks/use-financial";
import { FinancialEntryType } from "@/lib/enums";
import { MobileBackButton } from "@/components/shared/mobile-back-button";
import type { FinancialEntryInput } from "@/schemas/financial";

export function Page() {
  const create = useCreateFinancialEntry();
  const handleSubmit = async (data: FinancialEntryInput) => {
    await create.mutateAsync(data);
  };

  return (
    <RequirePermission permission="financial.manage">
      <div className="space-y-6">
        <MobileBackButton to="/financeiro" />
        <h1 className="text-2xl font-bold">Despesas</h1>
        <FinancialEntryForm defaultType={FinancialEntryType.DESPESA} onSubmit={handleSubmit} />
      </div>
    </RequirePermission>
  );
}
