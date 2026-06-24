import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { RequirePermission } from "@/app/require-role";
import { useInspections } from "@/hooks/use-inspections";
import { VistoriaFilters } from "@/components/vistoria/vistoria-filters";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { DataTable } from "@/components/shared/data-table";
import { ExportButton } from "@/components/shared/export-button";
import { formatDate } from "@/lib/formatters";
import { exportToExcel } from "@/lib/export-excel";
import { exportToPdf } from "@/lib/export-pdf";
import type { InspectionFilters } from "@/services/inspection-service";
import type { Inspection } from "@/services/inspection-service";

export function Page() {
  const [filters, setFilters] = useState<InspectionFilters>({});
  const { data = [], isLoading } = useInspections(filters);

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
      `${data.length} vistoria${data.length !== 1 ? "s" : ""} encontrada${data.length !== 1 ? "s" : ""}`,
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
        subtitle: `${data.length} vistoria${data.length !== 1 ? "s" : ""} encontrada${data.length !== 1 ? "s" : ""}`,
        sheetName: "Vistorias",
      },
    );
  };

  return (
    <RequirePermission permission="reports.export">
      <div className="space-y-8">
        <PageHeader
          title="Relatórios"
          description={`${data.length} vistoria${data.length !== 1 ? "s" : ""} encontrada${data.length !== 1 ? "s" : ""}`}
          actions={
            <ExportButton
              size="default"
              onExportPdf={exportPdf}
              onExportExcel={exportExcel}
              disabled={data.length === 0}
            />
          }
        />

        <VistoriaFilters filters={filters} onChange={setFilters} />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <DataTable<Inspection>
            columns={[
              { key: "inspection_number", header: "#", render: (i) => i.inspection_number },
              { key: "plate", header: "Placa", render: (i) => i.plate },
              { key: "client_name", header: "Cliente", render: (i) => i.client_name },
              { key: "inspection_date", header: "Data", render: (i) => formatDate(i.inspection_date) },
              { key: "status", header: "Status", render: (i) => i.status },
            ]}
            rows={data}
            rowKey={(i) => i.id}
            emptyMessage="Nenhuma vistoria encontrada com os filtros aplicados."
          />
        )}
      </div>
    </RequirePermission>
  );
}
