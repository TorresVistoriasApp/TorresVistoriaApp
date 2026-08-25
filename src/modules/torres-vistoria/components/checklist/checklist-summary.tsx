import { ChecklistStatus } from "@/modules/torres-vistoria/domain/enums";
import { getChecklistStatusLabel } from "@/modules/torres-vistoria/domain/checklist/checklist-status";
import { cn } from "@/shared/lib/utils";
import { Circle, Clock } from "lucide-react";

type ChecklistSummaryProps = {
  total: number;
  evaluated: number;
  conforme: number;
  naoConforme: number;
  pending: number;
  na: number;
  variant?: "full" | "compact";
};

export function ChecklistSummary({
  total,
  evaluated,
  conforme,
  naoConforme,
  pending,
  na,
  variant = "full",
}: ChecklistSummaryProps) {
  const evaluatedPct = total > 0 ? Math.round((evaluated / total) * 100) : 0;
  const conformePct = evaluated > 0 ? Math.round((conforme / evaluated) * 100) : 0;

  const aprovadoLabel = getChecklistStatusLabel(ChecklistStatus.CONFORME);
  const ressalvasLabel = getChecklistStatusLabel(ChecklistStatus.NAO_CONFORME);
  const naoAvaliadoLabel = getChecklistStatusLabel(ChecklistStatus.NA);

  if (variant === "compact") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold tabular-nums">
            {evaluated}/{total} avaliados
          </p>
          <div className="flex shrink-0 items-center gap-2 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1 text-success">{conforme}</span>
            {naoConforme > 0 && (
              <span className="inline-flex items-center gap-1 text-warning">{naoConforme}</span>
            )}
            {pending > 0 && (
              <span className="inline-flex items-center gap-1 text-warning">
                <Clock className="size-3" />
                {pending}
              </span>
            )}
          </div>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-[width] duration-200 ease-out"
            style={{ width: `${evaluatedPct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="ui-panel space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="ui-microlabel">Resumo do checklist</h2>
          <p className="ui-metric mt-1 text-lg font-bold text-foreground">
            {evaluated} de {total} itens avaliados
            <span className="ml-1 text-sm font-normal text-muted-foreground">({evaluatedPct}%)</span>
          </p>
        </div>
        {pending > 0 && (
          <span className="ui-chip-warning">
            <Clock className="size-3.5" aria-hidden />
            {pending} pendente{pending > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard
          label={aprovadoLabel}
          value={conforme}
          tone="success"
          sub={evaluated > 0 ? `${conformePct}% dos avaliados` : undefined}
        />
        <StatCard
          label={ressalvasLabel}
          value={naoConforme}
          tone="warning"
        />
        <StatCard icon={Circle} label={naoAvaliadoLabel} value={na} tone="muted" />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progresso da avaliação</span>
          <span>{evaluatedPct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-[width] duration-200 ease-out"
            style={{ width: `${evaluatedPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  sub,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "success" | "warning" | "muted";
  sub?: string;
}) {
  const tones = {
    success: "text-success",
    warning: "text-warning",
    muted: "text-muted-foreground",
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-1.5">
        {Icon ? <Icon className={cn("size-3.5 shrink-0", tones[tone])} /> : null}
        <span className="ui-microlabel leading-tight">{label}</span>
      </div>
      <p className="ui-metric mt-1.5 text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function summarizeChecklist(items: { status: string }[]) {
  const total = items.length;
  const conforme = items.filter((i) => i.status === ChecklistStatus.CONFORME).length;
  const naoConforme = items.filter((i) => i.status === ChecklistStatus.NAO_CONFORME).length;
  const na = items.filter((i) => i.status === ChecklistStatus.NA).length;
  const pending = items.filter((i) => i.status === ChecklistStatus.PENDENTE).length;
  const evaluated = total - pending;

  return { total, evaluated, conforme, naoConforme, pending, na };
}
