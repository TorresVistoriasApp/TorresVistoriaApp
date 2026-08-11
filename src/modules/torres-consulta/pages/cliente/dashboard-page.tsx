import { Link } from "react-router-dom";
import { Download, FileSearch, FileText, Plus, Wallet } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import { KpiCard } from "@/shared/components/charts/kpi-card";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  useConsumerConsultas,
  useConsumerDashboardSummary,
} from "@/modules/torres-consulta/hooks/use-consumer-consultas";
import {
  canDownloadConsumerConsulta,
  formatConsumerConsultaDate,
  getConsumerConsultaIdentifier,
  getConsumerConsultaStatusClass,
  getConsumerConsultaStatusLabel,
} from "@/modules/torres-consulta/utils/consumer-consulta-presentation";

export function ClienteDashboardPage() {
  const { resolution } = usePrincipal();
  const { data: summary, isLoading: summaryLoading } = useConsumerDashboardSummary();
  const { data: consultas, isLoading: consultasLoading } = useConsumerConsultas();

  const displayName =
    resolution.status === "resolved" && resolution.principalType === PrincipalType.CUSTOMER
      ? resolution.consumerProfile.full_name.split(" ")[0]
      : null;

  const recentConsultas = consultas?.slice(0, 5) ?? [];
  const isLoading = summaryLoading || consultasLoading;

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

      {isLoading ? (
        <div className="flex min-h-[12rem] items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Consultas realizadas"
              value={String(summary?.totalConsultas ?? 0)}
              icon={FileSearch}
              themeIndex={0}
            />
            <KpiCard
              label="Relatórios disponíveis"
              value={String(summary?.completedConsultas ?? 0)}
              icon={FileText}
              themeIndex={1}
            />
            <KpiCard
              label="Créditos disponíveis"
              value={String(summary?.availableCredits ?? 0)}
              icon={Wallet}
              themeIndex={2}
            />
            <KpiCard
              label="Última consulta"
              value={
                summary?.lastConsulta
                  ? getConsumerConsultaIdentifier(summary.lastConsulta)
                  : "—"
              }
              icon={FileSearch}
              themeIndex={3}
            />
          </div>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-lg">Consultas recentes</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              {recentConsultas.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                  Você ainda não realizou consultas.{" "}
                  <Link to={ROUTES.consultaAppNovaConsulta} className="font-semibold text-primary">
                    Iniciar primeira consulta
                  </Link>
                </p>
              ) : (
                <table className="w-full min-w-[540px] text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-3">Data</th>
                      <th className="px-5 py-3">Identificador</th>
                      <th className="px-5 py-3">Plano</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentConsultas.map((consulta) => (
                      <tr key={consulta.id} className="border-b border-border/40 last:border-0">
                        <td className="px-5 py-4 text-muted-foreground">
                          {formatConsumerConsultaDate(consulta.createdAt)}
                        </td>
                        <td className="px-5 py-4 font-mono font-semibold">
                          {getConsumerConsultaIdentifier(consulta)}
                        </td>
                        <td className="px-5 py-4">{consulta.planName}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getConsumerConsultaStatusClass(
                              consulta.status,
                            )}`}
                          >
                            {getConsumerConsultaStatusLabel(consulta.status)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={ROUTES.consultaAppConsultaDetail(consulta.id)}>Ver</Link>
                            </Button>
                            {canDownloadConsumerConsulta(consulta) && (
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={consulta.documentUrl!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`Baixar relatório ${getConsumerConsultaIdentifier(consulta)}`}
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Baixar
                                </a>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
