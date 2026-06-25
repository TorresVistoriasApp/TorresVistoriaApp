import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { RequirePermission } from "@/app/require-role";
import { PageHeader } from "@/components/shared/page-header";
import { ExportButton } from "@/components/shared/export-button";
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
import { cn } from "@/lib/utils";
import { exportToExcel } from "@/lib/export-excel";
import { exportToPdf } from "@/lib/export-pdf";
import type { FinancialEntry } from "@/services/financial-service";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export function Page() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
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

  const exportPdfRows = entries.map((e) => ({
    tipo: e.entry_type,
    descricao: e.description,
    valor: formatCurrency(Number(e.amount)),
    data: formatDate(e.entry_date),
  }));

  const exportSpreadsheetRows = entries.map((e) => ({
    tipo: e.entry_type,
    descricao: e.description,
    valor: Number(e.amount),
    data: e.entry_date,
  }));

  const exportPdf = async () => {
    await exportToPdf(
      exportPdfRows,
      [
        { header: "Tipo", key: "tipo" },
        { header: "Descrição", key: "descricao" },
        { header: "Valor", key: "valor" },
        { header: "Data", key: "data" },
      ],
      "financeiro.pdf",
      "Relatório financeiro",
      "Receitas, despesas e fluxo de caixa",
    );
  };

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime(),
      ),
    [entries],
  );

  const totalPages = Math.max(1, Math.ceil(sortedEntries.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedEntries = sortedEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const exportExcel = async () => {
    await exportToExcel(
      exportSpreadsheetRows,
      [
        { header: "Tipo", key: "tipo", width: 12 },
        { header: "Descrição", key: "descricao", width: 32 },
        { header: "Valor", key: "valor", width: 14, numFmt: '"R$" #,##0.00' },
        { header: "Data", key: "data", width: 14 },
      ],
      "financeiro.xlsx",
      {
        title: "Relatório financeiro",
        subtitle: "Receitas, despesas e fluxo de caixa",
        sheetName: "Financeiro",
      },
    );
  };

  return (
    <RequirePermission permission="financial.manage">
      <div className="space-y-8">
        <PageHeader
          title="Financeiro"
          description="Receitas, despesas e fluxo de caixa"
          actions={
            <div className="flex w-full flex-col gap-2 max-[429px]:flex-col min-[430px]:max-sm:grid min-[430px]:max-sm:grid-cols-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <div className="max-[429px]:w-full max-[429px]:[&_button]:w-full min-[430px]:max-sm:[&_button]:w-full sm:[&_button]:w-auto">
                <ExportButton
                  onExportPdf={exportPdf}
                  onExportExcel={exportExcel}
                  disabled={entries.length === 0}
                />
              </div>
              <div className="max-[429px]:w-full max-[429px]:[&_button]:w-full min-[430px]:max-sm:[&_button]:w-full sm:[&_button]:w-auto">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="accent" className="touch-target w-full sm:w-auto">
                      <Plus className="h-4 w-4" />
                      Adicionar lançamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className={cn(
                      "flex max-h-[min(92dvh,720px)] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0",
                      "inset-x-0 bottom-0 top-auto translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none border-b-0",
                      "sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:border-b",
                    )}
                  >
                    <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-border sm:hidden" aria-hidden />
                    <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-6">
                      <DialogHeader className="space-y-1.5 pb-4 text-left">
                        <DialogTitle>Novo lançamento</DialogTitle>
                        <DialogDescription>
                          Registre receita, despesa ou custo em poucos passos.
                        </DialogDescription>
                      </DialogHeader>
                      <FinancialEntryForm
                        variant="dialog"
                        open={dialogOpen}
                        onCancel={() => setDialogOpen(false)}
                        onSubmit={handleSubmit}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          }
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
            <KpiCard label="Receitas" value={formatCurrency(summary?.revenue ?? 0)} themeIndex={0} />
            <KpiCard label="Despesas" value={formatCurrency(summary?.expenses ?? 0)} themeIndex={1} />
            <KpiCard label="Lucro líquido" value={formatCurrency(summary?.netProfit ?? 0)} themeIndex={2} />
            <KpiCard label="Margem" value={`${(summary?.margin ?? 0).toFixed(1)}%`} themeIndex={3} />
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Lançamentos</CardTitle>
            {entries.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <label htmlFor="financeiro-page-size" className="whitespace-nowrap">
                  Exibir
                </label>
                <select
                  id="financeiro-page-size"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value) as (typeof PAGE_SIZE_OPTIONS)[number]);
                    setPage(1);
                  }}
                  className="flex h-9 min-w-[88px] touch-target rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span className="whitespace-nowrap">por página</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum lançamento.</p>
            ) : (
              <>
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
                  rows={paginatedEntries}
                  rowKey={(e) => e.id}
                />

                {sortedEntries.length > pageSize && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      {(currentPage - 1) * pageSize + 1}–
                      {Math.min(currentPage * pageSize, sortedEntries.length)} de{" "}
                      {sortedEntries.length} lançamentos
                    </p>
                    <div className="flex items-center justify-center gap-3 sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        onClick={() => setPage((value) => Math.max(1, value - 1))}
                      >
                        Anterior
                      </Button>
                      <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-primary/10 px-3 text-sm font-semibold text-primary">
                        {currentPage}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </RequirePermission>
  );
}
