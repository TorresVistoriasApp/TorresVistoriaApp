import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChecklistForm } from "@/components/forms/checklist-form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useInspectionChecklist, useUpdateChecklistItem } from "@/hooks/use-checklist";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { ChecklistStatus } from "@/lib/enums";

export function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: items = [], isLoading } = useInspectionChecklist(id);
  const updateItem = useUpdateChecklistItem(id!);

  const progress = useMemo(() => {
    const total = items.length;
    const conforme = items.filter((i) => i.status === ChecklistStatus.CONFORME).length;
    return { total, conforme, pct: total > 0 ? (conforme / total) * 100 : 0 };
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="touch-target"
          onClick={() => navigate(`/vistorias/${id}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Checklist</h1>
          <p className="text-xs text-muted-foreground">
            {progress.conforme}/{progress.total} conforme · Passo 3 de 3
          </p>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-green-500 transition-all"
          style={{ width: `${progress.pct}%` }}
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ChecklistForm
          items={items}
          disabled={updateItem.isPending}
          onUpdate={(itemId, status, notes) => {
            void updateItem.mutateAsync({
              id: itemId,
              patch: {
                status: status as typeof ChecklistStatus.CONFORME,
                notes: notes ?? null,
              },
            });
          }}
        />
      )}

      <Button
        className="h-12 w-full touch-target"
        onClick={() => navigate(`/vistorias/${id}/laudo`)}
      >
        <FileText className="mr-2 h-5 w-5" />
        Finalizar e gerar laudo
      </Button>
    </div>
  );
}
