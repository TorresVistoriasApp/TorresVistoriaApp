import { Coins } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { useCreditBalance } from "@/modules/torres-consulta/hooks/use-credit-balance";

export function CreditBalanceCard() {
  const { data, isLoading } = useCreditBalance();

  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Coins className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Créditos disponíveis
          </p>
          <p className="text-2xl font-bold tracking-tight">
            {isLoading ? "—" : (data?.available ?? "—")}
          </p>
          {data?.pending ? (
            <p className="text-xs text-muted-foreground">{data.pending} reservados</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
