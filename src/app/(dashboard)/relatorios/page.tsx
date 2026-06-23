import { RequirePermission } from "@/app/require-role";
import { useInspections } from "@/hooks/use-inspections";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/lib/export-excel";

export function Page() {
  const { data = [], isLoading } = useInspections();

  const exportCsv = () => {
    const header = "Numero,Placa,Cliente,Data,Status\n";
    const rows = data
      .map(
        (i) =>
          `${i.inspection_number},${i.plate},${i.client_name},${i.inspection_date},${i.status}`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio-vistorias.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = async () => {
    await exportToExcel(
      data.map((i) => ({
        numero: i.inspection_number,
        placa: i.plate,
        cliente: i.client_name,
        data: i.inspection_date,
        status: i.status,
        marca: i.brand,
        modelo: i.model,
      })),
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={data.length === 0}>
            Exportar CSV
          </Button>
          <Button onClick={() => void exportExcel()} disabled={data.length === 0}>
            Exportar Excel
          </Button>
        </div>
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Placa</th>
                <th className="px-4 py-2 text-left">Cliente</th>
                <th className="px-4 py-2 text-left">Data</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((i) => (
                <tr key={i.id} className="border-t border-border">
                  <td className="px-4 py-2">{i.inspection_number}</td>
                  <td className="px-4 py-2">{i.plate}</td>
                  <td className="px-4 py-2">{i.client_name}</td>
                  <td className="px-4 py-2">{formatDate(i.inspection_date)}</td>
                  <td className="px-4 py-2">{i.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </RequirePermission>
  );
}
