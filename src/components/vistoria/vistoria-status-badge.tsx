import { InspectionStatus } from "@/lib/enums";
import { cn } from "@/lib/utils";

const labels: Record<string, string> = {
  [InspectionStatus.DRAFT]: "Rascunho",
  [InspectionStatus.COMPLETED]: "Concluída",
  [InspectionStatus.ARCHIVED]: "Arquivada",
};

const styles: Record<string, string> = {
  [InspectionStatus.DRAFT]: "border-warning/30 bg-warning/10 text-warning",
  [InspectionStatus.COMPLETED]: "border-success/30 bg-success/10 text-success",
  [InspectionStatus.ARCHIVED]: "border-border bg-muted/50 text-muted-foreground",
};

export function VistoriaStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        styles[status] ?? "border-border bg-muted",
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
