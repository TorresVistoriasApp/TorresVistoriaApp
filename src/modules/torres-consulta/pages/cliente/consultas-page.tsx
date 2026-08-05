import { Download } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/components/empty-state";

const MOCK_ALL_CONSULTAS = [
  { id: "1", date: "05/08/2026", plate: "ABC1D23", type: "Completo", status: "Disponível" },
  { id: "2", date: "28/07/2026", plate: "XYZ9A87", type: "Básico", status: "Disponível" },
  { id: "3", date: "15/07/2026", plate: "JKL4M56", type: "Premium", status: "Processando" },
  { id: "4", date: "02/07/2026", plate: "MNO3P45", type: "Completo", status: "Disponível" },
  { id: "5", date: "20/06/2026", plate: "QRS6T78", type: "Básico", status: "Expirado" },
] as const;

export function ClienteConsultasPage() {
  const consultas = [...MOCK_ALL_CONSULTAS];

  if (consultas.length === 0) {
    return (
      <EmptyState
        title="Nenhuma consulta realizada"
        description="Realize sua primeira consulta veicular para ver o histórico aqui."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Minhas Consultas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Histórico completo de consultas veiculares realizadas.
        </p>
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-lg">Todas as consultas</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[540px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Data</th>
                <th className="px-5 py-3">Placa</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {consultas.map((consulta) => (
                <tr key={consulta.id} className="border-b border-border/40 last:border-0">
                  <td className="px-5 py-4 text-muted-foreground">{consulta.date}</td>
                  <td className="px-5 py-4 font-mono font-semibold">{consulta.plate}</td>
                  <td className="px-5 py-4">{consulta.type}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        consulta.status === "Disponível"
                          ? "bg-emerald-500/10 text-emerald-700"
                          : consulta.status === "Processando"
                            ? "bg-amber-500/10 text-amber-700"
                            : "bg-slate-500/10 text-slate-600"
                      }`}
                    >
                      {consulta.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={consulta.status !== "Disponível"}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Baixar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
