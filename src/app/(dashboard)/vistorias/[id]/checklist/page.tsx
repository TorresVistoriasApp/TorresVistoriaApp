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
import { ROUTES, withNewInspectionFlow } from "@/lib/constants";

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
        toast(`Avalie todos os itens. Faltam ${pendingCount} pendente(s).`);
        return;
      }
      if (missingNotesCount > 0) {
        toast(`Preencha observações nos ${missingNotesCount} item(ns) não conforme(s).`);
        return;
      }
    }
    if (!id) return;
    const path = ROUTES.inspectionReport(id);
    navigate(isWizardFlow ? withNewInspectionFlow(path) : path);
  };

  const checklistContent = (
    <div className="space-y-4 md:space-y-6">
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

      {!isLoading && items.length > 0 && (
        <div className="border-t border-border pt-4 md:pt-2">
          {isWizardFlow ? (
            <WizardNavButtons
              onBack={() => id && navigate(withNewInspectionFlow(ROUTES.inspectionPhotos(id)))}
              onNext={goToLaudo}
              nextLabel="Revisar e gerar laudo"
            />
          ) : (
            <Button className="h-12 w-full touch-target" size="lg" onClick={goToLaudo}>
              <FileText className="mr-2 h-5 w-5" />
              Revisar e gerar laudo
            </Button>
          )}
        </div>
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
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center gap-2 md:gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="touch-target shrink-0"
          onClick={() => id && navigate(ROUTES.inspection(id))}
          aria-label="Voltar para vistoria"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold md:text-xl">Checklist</h1>
          <p className="text-xs text-muted-foreground">
            Toque no status. Observações apenas em itens não conformes.
          </p>
        </div>
      </div>
      {checklistContent}
    </div>
  );
}
