import { Archive, CheckCircle2, ClipboardList, FilePenLine } from "lucide-react";
import { InspectionStatus } from "@/lib/enums";
import type { Inspection } from "@/services/inspection-service";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { formatNumber } from "@/lib/formatters";

type ReportsSummaryProps = {
  inspections: Inspection[];
  isLoading?: boolean;
};

export function ReportsSummary({ inspections, isLoading }: ReportsSummaryProps) {
  const draftCount = inspections.filter((i) => i.status === InspectionStatus.DRAFT).length;
  const completedCount = inspections.filter((i) => i.status === InspectionStatus.COMPLETED).length;
  const archivedCount = inspections.filter((i) => i.status === InspectionStatus.ARCHIVED).length;

  return (
    <StatsGrid
      items={[
        {
          title: "Total filtrado",
          value: formatNumber(inspections.length),
          icon: ClipboardList,
          isLoading,
        },
        {
          title: "Rascunhos",
          value: formatNumber(draftCount),
          icon: FilePenLine,
          isLoading,
        },
        {
          title: "Concluídas",
          value: formatNumber(completedCount),
          icon: CheckCircle2,
          isLoading,
        },
        {
          title: "Arquivadas",
          value: formatNumber(archivedCount),
          icon: Archive,
          isLoading,
        },
      ]}
    />
  );
}
