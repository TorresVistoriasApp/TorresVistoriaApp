import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export function FinancialPage() {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h1 className="text-2xl font-bold">Financeiro</h1>
      <Card>
        <CardHeader><CardTitle>Receitas, despesas e fluxo de caixa</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Módulo preparado para lançamentos em `financial_entries` com exportação PDF/Excel/CSV.
        </CardContent>
      </Card>
    </div>
  );
}
