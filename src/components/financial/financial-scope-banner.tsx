import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { useFinancialScope } from "@/hooks/use-financial-scope";

export function FinancialScopeBanner() {
  const { isPersonalView } = useFinancialScope();

  if (!isPersonalView) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Info className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">Seu financeiro pessoal</p>
          <p className="text-xs text-muted-foreground">
            Receitas e lançamentos limitados às vistorias criadas por você. Despesas e custos da
            empresa não são exibidos.
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0 touch-target">
        <Link to={ROUTES.inspections}>Ver minhas vistorias</Link>
      </Button>
    </div>
  );
}
