import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthlyChartNavigationProps {
  rangeLabel: string;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function MonthlyChartNavigation({
  rangeLabel,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}: MonthlyChartNavigationProps) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
      <div className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Período
        </span>
        <span className="block truncate text-xs font-bold text-foreground">{rangeLabel}</span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border/70 disabled:hover:bg-card disabled:hover:text-muted-foreground"
          onClick={onPrevious}
          disabled={!canPrevious}
          aria-label="Ver meses anteriores"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border/70 disabled:hover:bg-card disabled:hover:text-muted-foreground"
          onClick={onNext}
          disabled={!canNext}
          aria-label="Ver próximos meses"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
