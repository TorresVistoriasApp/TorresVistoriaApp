import { ChecklistStatus } from "@/lib/enums";

type ChecklistSummaryProps = {
  total: number;
  conforme: number;
  naoConforme: number;
  na: number;
};

export function ChecklistSummary({ total, conforme, naoConforme, na }: ChecklistSummaryProps) {
  const pct = total > 0 ? Math.round((conforme / total) * 100) : 0;

  return (
    <div className="space-y-2 rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-medium">
          {conforme}/{total} conforme ({pct}%)
        </span>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="text-destructive">{naoConforme} não conforme</span>
          <span>{na} N/A</span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function summarizeChecklist(items: { status: string }[]) {
  return {
    total: items.length,
    conforme: items.filter((i) => i.status === ChecklistStatus.CONFORME).length,
    naoConforme: items.filter((i) => i.status === ChecklistStatus.NAO_CONFORME).length,
    na: items.filter((i) => i.status === ChecklistStatus.NA).length,
  };
}
