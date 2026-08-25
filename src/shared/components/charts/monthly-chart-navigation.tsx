import { ChevronLeft, ChevronRight } from "lucide-react";

const navButtonClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors duration-150 hover:bg-brand-subtle hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-muted-foreground";

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
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-border bg-muted px-3 py-2">
      <div className="min-w-0">
        <span className="ui-microlabel block">Período</span>
        <span className="ui-metric block truncate text-[13px] font-bold text-foreground">
          {rangeLabel}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          className={navButtonClass}
          onClick={onPrevious}
          disabled={!canPrevious}
          aria-label="Ver meses anteriores"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={navButtonClass}
          onClick={onNext}
          disabled={!canNext}
          aria-label="Ver próximos meses"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
