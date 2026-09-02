import { Link } from "react-router-dom";
import { Car } from "lucide-react";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/components/empty-state";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { ROUTES } from "@/config/routes";
import { ConsultaFeatureGate } from "@/modules/torres-consulta/components/consulta-feature-gate";
import { formatServicePrice, usePlatformServices } from "@/modules/torres-vistoria";

export function ConsultaServicesPage() {
  const { data: services, isLoading, error } = usePlatformServices();

  return (
    <ConsultaFeatureGate>
      <div className="space-y-6">
        <PageHeader
          badge="Torres Consulta"
          title="Serviços"
          description="Valores da vistoria: somente laudo ou laudo com consulta veicular."
          actions={
            <Button asChild>
              <Link to={ROUTES.inspectionNew}>
                <Car className="h-4 w-4" />
                Nova vistoria
              </Link>
            </Button>
          }
        />

        {isLoading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingSpinner label="Carregando serviços..." />
          </div>
        ) : error || !services?.length ? (
          <EmptyState
            title="Serviços indisponíveis"
            description="Não foi possível carregar a tabela de valores. Tente novamente em instantes."
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Tabela de valores</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/50 p-0">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 md:px-6"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{service.name}</p>
                    <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                      {service.includes_vehicle_consultation
                        ? "Laudo + consulta"
                        : "Somente laudo"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {service.description ??
                        (service.includes_vehicle_consultation
                          ? "Laudo cautelar com consulta veicular."
                          : "Somente laudo cautelar.")}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-primary">
                    {formatServicePrice(service.base_price, service.currency)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </ConsultaFeatureGate>
  );
}
