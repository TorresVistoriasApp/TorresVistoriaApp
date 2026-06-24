import { useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { RequirePermission } from "@/app/require-role";
import { PageHeader } from "@/components/shared/page-header";
import { FinancialEntryForm } from "@/components/forms/financial-entry-form";
import {
  useFinancialEntries,
  useFinancialSummary,
  useCreateFinancialEntry,
} from "@/hooks/use-financial";
import { useToast } from "@/hooks/use-toast";
import { KpiCard } from "@/components/charts/kpi-card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { DataTable } from "@/components/shared/data-table";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { FinancialEntryInput } from "@/schemas/financial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { exportToExcel } from "@/lib/export-excel";
import { exportToCsv } from "@/lib/export-csv";
import type { FinancialEntry } from "@/services/financial-service";

export function Page() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: summary, isLoading } = useFinancialSummary();
  const { data: entries = [] } = useFinancialEntries();
  const create = useCreateFinancialEntry();
  const { toast } = useToast();

  const handleSubmit = async (data: FinancialEntryInput) => {
    try {
      await create.mutateAsync(data);
      toast("Lançamento registrado");
      setDialogOpen(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao salvar");
    }
  };

  const exportRows = entries.map((e) => ({
    tipo: e.entry_type,
    descricao: e.description,
    valor: Number(e.amount),
    data: e.entry_date,
  }));

  const exportCsv = () => {
    exportToCsv(
      exportRows,
      [
        { header: "Tipo", key: "tipo" },
        { header: "Descrição", key: "descricao" },
        { header: "Valor", key: "valor" },
        { header: "Data", key: "data" },
      ],
      "financeiro.csv",
    );
  };

  const exportExcel = async () => {
    await exportToExcel(
      exportRows,
      [
        { header: "Tipo", key: "tipo", width: 12 },
        { header: "Descrição", key: "descricao", width: 32 },
        { header: "Valor", key: "valor", width: 14 },
        { header: "Data", key: "data", width: 14 },
      ],
      "financeiro.xlsx",
    );
  };

  return (
    <RequirePermission permission="financial.manage">
      <div className="space-y-8">
        <PageHeader
          title="Financeiro"
          description="Receitas, despesas e fluxo de caixa"
          actions={
            <>
              <Button asChild variant="outline" size="sm" className="touch-target">
                <Link to="/financeiro/receitas">Receitas</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="touch-target">
                <Link to="/financeiro/despesas">Despesas</Link>
              </Button>
              <Button variant="outline" size="sm" className="touch-target" onClick={exportCsv} disabled={entries.length === 0}>
                Exportar CSV
              </Button>
              <Button variant="outline" size="sm" className="touch-target" onClick={() => void exportExcel()} disabled={entries.length === 0}>
                Exportar Excel
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="accent" className="touch-target">
                    <Plus className="h-4 w-4" />
                    Novo lançamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Novo lançamento</DialogTitle>
                    <DialogDescription>Registre receita, despesa ou custo</DialogDescription>
                  </DialogHeader>
                  <FinancialEntryForm onSubmit={handleSubmit} />
                </DialogContent>
              </Dialog>
            </>
          }
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Receitas" value={formatCurrency(summary?.revenue ?? 0)} />
            <KpiCard label="Despesas" value={formatCurrency(summary?.expenses ?? 0)} />
            <KpiCard label="Lucro líquido" value={formatCurrency(summary?.netProfit ?? 0)} />
            <KpiCard label="Margem" value={`${(summary?.margin ?? 0).toFixed(1)}%`} />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lançamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum lançamento.</p>
            ) : (
              <DataTable<FinancialEntry>
                columns={[
                  { key: "entry_date", header: "Data", render: (e) => formatDate(e.entry_date) },
                  { key: "entry_type", header: "Tipo", render: (e) => e.entry_type },
                  { key: "description", header: "Descrição", render: (e) => e.description },
                  {
                    key: "amount",
                    header: "Valor",
                    render: (e) => formatCurrency(Number(e.amount)),
                    className: "text-right font-medium",
                  },
                ]}
                rows={entries}
                rowKey={(e) => e.id}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </RequirePermission>
  );
}
