import { RequirePermission } from "@/app/require-role";
import { FinancialEntryForm } from "@/components/forms/financial-entry-form";
import { useFinancialEntries, useFinancialSummary, useCreateFinancialEntry } from "@/hooks/use-financial";
import { useToast } from "@/hooks/use-toast";
import { KpiCard } from "@/components/charts/kpi-card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { formatCurrency } from "@/lib/formatters";
import type { FinancialEntryInput } from "@/schemas/financial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Page() {
  const { data: summary, isLoading } = useFinancialSummary();
  const { data: entries = [] } = useFinancialEntries();
  const create = useCreateFinancialEntry();
  const { toast } = useToast();

  const handleSubmit = async (data: FinancialEntryInput) => {
    try {
      await create.mutateAsync(data);
      toast("Lançamento registrado");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao salvar");
    }
  };

  return (
    <RequirePermission permission="financial.manage">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <h1 className="flex-1 text-2xl font-bold">Financeiro</h1>
          <Button asChild variant="outline" size="sm"><Link to="/financeiro/receitas">Receitas</Link></Button>
          <Button asChild variant="outline" size="sm"><Link to="/financeiro/despesas">Despesas</Link></Button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Receitas" value={formatCurrency(summary?.revenue ?? 0)} />
            <KpiCard label="Despesas" value={formatCurrency(summary?.expenses ?? 0)} />
            <KpiCard label="Lucro líquido" value={formatCurrency(summary?.netProfit ?? 0)} />
            <KpiCard label="Margem" value={`${(summary?.margin ?? 0).toFixed(1)}%`} />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <FinancialEntryForm onSubmit={handleSubmit} />
          <Card>
            <CardHeader><CardTitle>Últimos lançamentos</CardTitle></CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum lançamento.</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {entries.slice(0, 10).map((e) => (
                    <li key={e.id} className="flex justify-between py-2">
                      <span>{e.description}</span>
                      <span className="font-medium">{formatCurrency(Number(e.amount))}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RequirePermission>
  );
}
