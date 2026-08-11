import { Link } from "react-router-dom";
import { Download, FileSearch, FileText, Plus } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import { KpiCard } from "@/shared/components/charts/kpi-card";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

const MOCK_CONSULTAS = [
  {
    id: "1",
    date: "05/08/2026",
    plate: "ABC1D23",
    type: "Completo",
    status: "Disponível",
  },
  {
    id: "2",
    date: "28/07/2026",
    plate: "XYZ9A87",
    type: "Básico",
    status: "Disponível",
  },
  {
    id: "3",
    date: "15/07/2026",
    plate: "JKL4M56",
    type: "Premium",
    status: "Processando",
  },
] as const;

export function ClienteDashboardPage() {
  const { resolution } = usePrincipal();
  const displayName =
    resolution.status === "resolved" && resolution.principalType === PrincipalType.CUSTOMER
      ? resolution.consumerProfile.full_name.split(" ")[0]
      : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            {displayName ? `Olá, ${displayName}` : "Início"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe suas consultas e relatórios veiculares.
          </p>
        </div>
        <Button asChild>
          <Link to={ROUTES.consultaAppNovaConsulta}>
            <Plus className="h-4 w-4" />
            Nova consulta
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Consultas realizadas" value="12" icon={FileSearch} themeIndex={0} />
        <KpiCard label="Relatórios disponíveis" value="10" icon={FileText} themeIndex={1} />
        <KpiCard label="Downloads realizados" value="8" icon={Download} themeIndex={2} />
        <KpiCard label="Última consulta" value="ABC1D23" icon={FileSearch} themeIndex={3} />
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-lg">Consultas recentes</CardTitle>
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
              {MOCK_CONSULTAS.map((consulta) => (
                <tr key={consulta.id} className="border-b border-border/40 last:border-0">
                  <td className="px-5 py-4 text-muted-foreground">{consulta.date}</td>
                  <td className="px-5 py-4 font-mono font-semibold">{consulta.plate}</td>
                  <td className="px-5 py-4">{consulta.type}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        consulta.status === "Disponível"
                          ? "bg-emerald-500/10 text-emerald-700"
                          : "bg-amber-500/10 text-amber-700"
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
                      aria-label={`Baixar relatório da placa ${consulta.plate}`}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Baixar Relatório
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
