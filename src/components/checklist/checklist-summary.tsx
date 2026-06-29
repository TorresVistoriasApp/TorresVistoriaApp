import { ChecklistStatus } from "@/lib/enums";
import { getChecklistStatusLabel } from "@/lib/checklist-status";
import { cn } from "@/lib/utils";
import { AlertTriangle, Check, Circle, Clock } from "lucide-react";

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
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <Check className="size-3" />
              {conforme}
            </span>
            {naoConforme > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-700">
                <AlertTriangle className="size-3" />
                {naoConforme}
              </span>
            )}
            {pending > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-700">
                <Clock className="size-3" />
                {pending}
              </span>
            )}
          </div>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${evaluatedPct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-soft sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Resumo do checklist
          </h2>
          <p className="mt-1 text-lg font-semibold">
            {evaluated} de {total} itens avaliados
            <span className="ml-1 text-sm font-normal text-muted-foreground">({evaluatedPct}%)</span>
          </p>
        </div>
        {pending > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <Clock className="size-3.5" />
            {pending} pendente{pending > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard
          icon={Check}
          label={aprovadoLabel}
          value={conforme}
          tone="success"
          sub={evaluated > 0 ? `${conformePct}% dos avaliados` : undefined}
        />
        <StatCard
          icon={AlertTriangle}
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
            className="h-full bg-primary transition-all duration-300"
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
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "success" | "warning" | "muted";
  sub?: string;
}) {
  const tones = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    muted: "border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <div className={cn("rounded-lg border p-3", tones[tone])}>
      <div className="flex items-center gap-1.5 text-xs font-medium opacity-80">
        <Icon className="size-3.5 shrink-0" />
        <span className="leading-tight">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] opacity-70">{sub}</p>}
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
