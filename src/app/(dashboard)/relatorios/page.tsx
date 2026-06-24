import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { RequirePermission } from "@/app/require-role";
import { useInspections } from "@/hooks/use-inspections";
import { VistoriaFilters } from "@/components/vistoria/vistoria-filters";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { DataTable } from "@/components/shared/data-table";
import { formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/lib/export-excel";
import { exportToCsv } from "@/lib/export-csv";
import type { InspectionFilters } from "@/services/inspection-service";
import type { Inspection } from "@/services/inspection-service";

export function Page() {
  const [filters, setFilters] = useState<InspectionFilters>({});
  const { data = [], isLoading } = useInspections(filters);

  const exportRows = useMemo(
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

  const exportCsv = () => {
    exportToCsv(exportRows, [
      { header: "Numero", key: "numero" },
      { header: "Placa", key: "placa" },
      { header: "Cliente", key: "cliente" },
      { header: "Data", key: "data" },
      { header: "Status", key: "status" },
      { header: "Marca", key: "marca" },
      { header: "Modelo", key: "modelo" },
    ], "relatorio-vistorias.csv");
  };

  const exportExcel = async () => {
    await exportToExcel(
      exportRows,
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
    );
  };

  return (
    <RequirePermission permission="reports.export">
      <div className="space-y-8">
        <PageHeader
          title="Relatórios"
          description={`${data.length} vistoria${data.length !== 1 ? "s" : ""} encontrada${data.length !== 1 ? "s" : ""}`}
          actions={
            <>
              <Button variant="outline" className="touch-target" onClick={exportCsv} disabled={data.length === 0}>
                Exportar CSV
              </Button>
              <Button variant="accent" className="touch-target" onClick={() => void exportExcel()} disabled={data.length === 0}>
                Exportar Excel
              </Button>
            </>
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
