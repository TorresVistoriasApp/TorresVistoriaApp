import { useMemo, useState } from "react";
import { PageHeader } from "@/shared/components/page-header";
import { RequirePermission } from "@/core/rbac/components/require-permission";
import { useInspections } from "@/modules/torres-vistoria/hooks/use-inspections";
import { VistoriaFilters } from "@/modules/torres-vistoria/components/vistoria/vistoria-filters";
import { ExportButton } from "@/shared/components/export-button";
import { ReportsSummary } from "@/modules/torres-vistoria/components/reports/reports-summary";
import { ReportsResults } from "@/modules/torres-vistoria/components/reports/reports-results";
import { formatDate } from "@/shared/lib/formatters";
import { exportToExcel } from "@/core/reporting/export-excel";
import { exportToPdf } from "@/core/reporting/export-pdf";
import type { InspectionFilters } from "@/modules/torres-vistoria/services/inspection-service";

export function ReportsPage() {
  const [filters, setFilters] = useState<InspectionFilters>({});
  const { data: pageData, isLoading } = useInspections({ ...filters, limit: 500, offset: 0 });
  const data = pageData?.data ?? [];

  const resultCountLabel = `${data.length} vistoria${data.length !== 1 ? "s" : ""} encontrada${data.length !== 1 ? "s" : ""}`;

  const exportSpreadsheetRows = useMemo(
    () =>
      data.map((i) => ({
        numero: i.inspection_number,
        placa: i.plate,
        cliente: i.client_name,
        data: i.inspection_date,
        status: i.status,
        marca: i.brand,
        modelo: i.model,
      })),
    [data],
  );

  const exportPdfRows = useMemo(
    () =>
      data.map((i) => ({
        numero: i.inspection_number,
        placa: i.plate,
        cliente: i.client_name,
        data: formatDate(i.inspection_date),
        status: i.status,
        marca: i.brand,
        modelo: i.model,
      })),
    [data],
  );

  const exportPdf = async () => {
    await exportToPdf(
      exportPdfRows,
      [
        { header: "Número", key: "numero" },
        { header: "Placa", key: "placa" },
        { header: "Cliente", key: "cliente" },
        { header: "Data", key: "data" },
        { header: "Status", key: "status" },
        { header: "Marca", key: "marca" },
        { header: "Modelo", key: "modelo" },
      ],
      "relatorio-vistorias.pdf",
      "Relatório de vistorias",
      resultCountLabel,
    );
  };

  const exportExcel = async () => {
    await exportToExcel(
      exportSpreadsheetRows,
      [
        { header: "Número", key: "numero", width: 10 },
        { header: "Placa", key: "placa", width: 12 },
        { header: "Cliente", key: "cliente", width: 24 },
        { header: "Data", key: "data", width: 14 },
        { header: "Status", key: "status", width: 14 },
        { header: "Marca", key: "marca", width: 16 },
        { header: "Modelo", key: "modelo", width: 16 },
      ],
      "relatorio-vistorias.xlsx",
      {
        title: "Relatório de vistorias",
        subtitle: resultCountLabel,
        sheetName: "Vistorias",
      },
    );
  };

  return (
    <RequirePermission permission="reports.export">
      <div className="min-w-0 space-y-6">
        <PageHeader
          title="Relatórios"
          badge="Análise e exportação"
          description="Consulte vistorias com filtros avançados e exporte os resultados em PDF ou Excel."
          actions={
            <ExportButton
              className="w-full sm:w-auto"
              buttonClassName="touch-target w-full justify-center sm:w-auto sm:justify-start"
              size="default"
              onExportPdf={exportPdf}
              onExportExcel={exportExcel}
              disabled={data.length === 0 || isLoading}
            />
          }
        />

        <ReportsSummary inspections={data} isLoading={isLoading} />

        <VistoriaFilters filters={filters} onChange={setFilters} />

        <ReportsResults inspections={data} isLoading={isLoading} />
      </div>
    </RequirePermission>
  );
}
