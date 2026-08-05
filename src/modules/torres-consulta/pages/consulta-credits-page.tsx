import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/components/empty-state";
import { isIntegrationAvailable } from "@/core/integrations/registry";
import { CreditBalanceCard } from "@/modules/torres-consulta/components/credit-balance-card";
import { QUERY_CATALOG } from "@/modules/torres-consulta/domain/query-catalog";

export function ConsultaCreditsPage() {
  const creditsEnabled = isIntegrationAvailable("credits");

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Torres Consulta"
        title="Créditos"
        description="Saldo, consumo por tipo de consulta e histórico de movimentações."
      />

      {creditsEnabled ? (
        <CreditBalanceCard />
      ) : (
        <EmptyState
          title="Sistema de créditos não configurado"
          description="O extrato aparece aqui assim que o provedor de créditos for conectado."
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tabela de consumo</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/50 p-0">
          {QUERY_CATALOG.map((item) => (
            <div key={item.type} className="flex items-center justify-between gap-4 px-5 py-3.5 md:px-6">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="truncate text-xs text-muted-foreground">{item.description}</p>
              </div>
              <span className="shrink-0 text-sm font-bold text-primary">
                {item.credits} {item.credits === 1 ? "crédito" : "créditos"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
