import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { ChecklistForm, validateChecklistCompletion } from "@/components/forms/checklist-form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  InspectionWizardShell,
  WizardNavButtons,
} from "@/components/vistoria/inspection-wizard-shell";
import { useInspectionChecklist, useUpdateChecklistItem } from "@/hooks/use-checklist";
import { Button } from "@/components/ui/button";
import { ChecklistStatus } from "@/lib/enums";
import { useToast } from "@/hooks/use-toast";

export function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWizardFlow = searchParams.get("fluxo") === "nova";
  const { data: items = [], isLoading } = useInspectionChecklist(id);
  const updateItem = useUpdateChecklistItem(id!);
  const { toast } = useToast();

  const goToLaudo = () => {
    const { valid, pendingCount, missingNotesCount } = validateChecklistCompletion(items);
    if (!valid) {
      if (pendingCount > 0) {
        toast(`Avalie todos os itens — ${pendingCount} pendente(s).`);
        return;
      }
      if (missingNotesCount > 0) {
        toast(`Preencha observações nos ${missingNotesCount} item(ns) não conforme(s).`);
        return;
      }
    }
    const suffix = isWizardFlow ? "?fluxo=nova" : "";
    navigate(`/vistorias/${id}/laudo${suffix}`);
  };

  const checklistContent = (
    <div className="space-y-6">
      {isLoading ? (
        <LoadingSpinner label="Carregando checklist..." />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum item de checklist encontrado. Tente recarregar a página.
          </p>
        </div>
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

      {isWizardFlow ? (
        <WizardNavButtons
          onBack={() => navigate(`/vistorias/${id}/fotos?fluxo=nova`)}
          onNext={goToLaudo}
          nextLabel="Revisar e gerar laudo"
        />
      ) : (
        <Button className="h-12 w-full touch-target" onClick={goToLaudo}>
          <FileText className="mr-2 h-5 w-5" />
          Revisar e gerar laudo
        </Button>
      )}
    </div>
  );

  if (isWizardFlow) {
    return (
      <InspectionWizardShell currentStep={3} inspectionId={id}>
        {checklistContent}
      </InspectionWizardShell>
    );
  }

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
            Toque no status e adicione observações
          </p>
        </div>
      </div>
      {checklistContent}
    </div>
  );
}
