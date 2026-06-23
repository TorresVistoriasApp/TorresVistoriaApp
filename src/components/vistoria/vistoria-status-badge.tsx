import { InspectionStatus } from "@/lib/enums";
import { cn } from "@/lib/utils";

const labels: Record<string, string> = {
  [InspectionStatus.DRAFT]: "Rascunho",
  [InspectionStatus.COMPLETED]: "Concluída",
  [InspectionStatus.ARCHIVED]: "Arquivada",
};

const styles: Record<string, string> = {
  [InspectionStatus.DRAFT]: "bg-warning/15 text-warning",
  [InspectionStatus.COMPLETED]: "bg-success/15 text-success",
  [InspectionStatus.ARCHIVED]: "bg-muted text-muted-foreground",
};

export function VistoriaStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status] ?? "bg-muted",
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
