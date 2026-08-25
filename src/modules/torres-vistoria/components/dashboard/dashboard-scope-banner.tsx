import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/config/routes";
import { useDashboardScope } from "@/modules/torres-vistoria/hooks/use-dashboard-scope";

export function DashboardScopeBanner() {
  const { isPersonalView } = useDashboardScope();

  if (!isPersonalView) return null;

  return (
    <div className="ui-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-start gap-3">
        <span className="ui-icon-box h-9 w-9">
          <Info className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-foreground">Seu painel pessoal</p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
            Métricas, gráficos e histórico limitados às vistorias criadas por você.
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0">
        <Link to={ROUTES.inspections}>Ver minhas vistorias</Link>
      </Button>
    </div>
  );
}
