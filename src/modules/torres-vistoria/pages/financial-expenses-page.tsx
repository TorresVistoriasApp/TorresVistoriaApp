import { RequirePermission } from "@/core/rbac/components/require-permission";
import { FinancialEntryForm } from "@/modules/torres-vistoria/components/forms/financial-entry-form";
import { useCreateFinancialEntry } from "@/modules/torres-vistoria/hooks/use-financial";
import { FinancialEntryType } from "@/modules/torres-vistoria/domain/enums";
import { MobileBackButton } from "@/shared/components/mobile-back-button";
import { ROUTES } from "@/config/routes";
import type { FinancialEntryInput } from "@/modules/torres-vistoria/schemas/financial";

export function FinancialExpensesPage() {
  const create = useCreateFinancialEntry();
  const handleSubmit = async (data: FinancialEntryInput) => {
    await create.mutateAsync(data);
  };

  return (
    <RequirePermission permission="financial.manage">
      <div className="space-y-6">
        <MobileBackButton to={ROUTES.financial} />
        <h1 className="text-2xl font-bold">Despesas</h1>
        <FinancialEntryForm defaultType={FinancialEntryType.DESPESA} onSubmit={handleSubmit} />
      </div>
    </RequirePermission>
  );
}
