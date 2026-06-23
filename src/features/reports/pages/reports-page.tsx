import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export function ReportsPage() {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h1 className="text-2xl font-bold">Relatórios</h1>
      <Card>
        <CardHeader><CardTitle>Filtros avançados</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Filtros por data, marca, modelo, placa, cliente, vistoriador e status.
        </CardContent>
      </Card>
    </div>
  );
}
