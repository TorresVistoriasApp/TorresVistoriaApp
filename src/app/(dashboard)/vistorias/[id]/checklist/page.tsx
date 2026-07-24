import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { ChecklistForm, validateChecklistCompletion } from "@/components/forms/checklist-form";
import {
  ParecerTecnicoSection,
  useParecerTecnicoDraft,
  validateParecerTecnico,
  type ParecerTecnicoValue,
} from "@/components/forms/parecer-tecnico-section";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  InspectionWizardShell,
  WizardNavButtons,
} from "@/components/vistoria/inspection-wizard-shell";
import { useInspectionChecklist, useUpdateChecklistItem } from "@/hooks/use-checklist";
import { useInspection } from "@/hooks/use-inspection";
import { useUpdateInspection } from "@/hooks/use-inspections";
import { Button } from "@/components/ui/button";
import { ChecklistStatus, InspectionStatus } from "@/lib/enums";
import { useToast } from "@/hooks/use-toast";
import { ROUTES, withNewInspectionFlow } from "@/lib/constants";
import type { VistoriaInput } from "@/schemas/vistoria";

export function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWizardFlow = searchParams.get("fluxo") === "nova";
  const { data: inspection } = useInspection(id);
  const { data: items = [], isLoading } = useInspectionChecklist(id);
  const updateItem = useUpdateChecklistItem(id!);
  const updateInspection = useUpdateInspection(id!);
  const { toast } = useToast();
  const [parecerErrors, setParecerErrors] = useState<
    Partial<Record<keyof ParecerTecnicoValue, string>>
  >({});

  const initialParecer = useMemo<ParecerTecnicoValue | null>(() => {
    if (!inspection) return null;
    return {
      opinion: inspection.opinion ?? "",
      technical_notes: inspection.technical_notes ?? "",
    };
  }, [inspection]);

  const persistParecer = useCallback(
    (value: ParecerTecnicoValue) => {
      if (!id) return;
      updateInspection.mutate(
        {
          opinion: (value.opinion || null) as VistoriaInput["opinion"],
          technical_notes: value.technical_notes,
        },
        {
          onError: (err) => {
            toast(err instanceof Error ? err.message : "Erro ao salvar parecer");
          },
        },
      );
    },
    [id, toast, updateInspection],
  );

  const [parecer, setParecer] = useParecerTecnicoDraft(initialParecer, persistParecer);

  useEffect(() => {
    if (isLoading || items.length === 0) return;
    if (window.location.hash !== "#checklist-parecer") return;
    requestAnimationFrame(() => {
      document.getElementById("checklist-parecer")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [isLoading, items.length]);

  const handleParecerChange = (value: ParecerTecnicoValue) => {
    setParecerErrors({});
    setParecer(value);
  };

  const goToLaudo = () => {
    const { valid, pendingCount, missingNotesCount } = validateChecklistCompletion(items);
    if (!valid) {
      if (pendingCount > 0) {
        toast(`Avalie todos os itens. Faltam ${pendingCount} pendente(s).`);
        return;
      }
      if (missingNotesCount > 0) {
        toast(`Preencha observações nos ${missingNotesCount} item(ns) com apontamentos.`);
        return;
      }
    }

    const parecerResult = validateParecerTecnico(parecer);
    if (!parecerResult.valid) {
      setParecerErrors(parecerResult.errors);
      toast(
        parecerResult.errors.opinion ??
          parecerResult.errors.technical_notes ??
          "Preencha o parecer técnico antes de continuar.",
      );
      requestAnimationFrame(() => {
        document.getElementById("checklist-parecer")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
      return;
    }

    if (!id) return;

    updateInspection.mutate(
      {
        opinion: parecer.opinion as VistoriaInput["opinion"],
        technical_notes: parecer.technical_notes.trim(),
      },
      {
        onSuccess: () => {
          const path = ROUTES.inspectionReport(id);
          navigate(isWizardFlow ? withNewInspectionFlow(path) : path);
        },
        onError: (err) => {
          toast(err instanceof Error ? err.message : "Erro ao salvar parecer");
        },
      },
    );
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
          onUpdate={(itemId, status, notes) => {
            updateItem.mutate(
              {
                id: itemId,
                patch: {
                  status: status as typeof ChecklistStatus.CONFORME,
                  notes: notes ?? null,
                },
              },
              {
                onError: (err) => {
                  toast(err instanceof Error ? err.message : "Erro ao salvar item");
                },
              },
            );
          }}
          afterItems={
            <ParecerTecnicoSection
              value={parecer}
              onChange={handleParecerChange}
              errors={parecerErrors}
              disabled={!inspection}
            />
          }
        />
      )}

      {!isLoading && items.length > 0 && (
        <div className="border-t border-border pt-4 md:pt-2">
          {isWizardFlow ? (
            <WizardNavButtons
              onBack={() => id && navigate(withNewInspectionFlow(ROUTES.inspectionPhotos(id)))}
              onNext={goToLaudo}
              nextLabel="Revisar e gerar laudo"
              nextDisabled={updateInspection.isPending}
            />
          ) : (
            <Button
              className="h-12 w-full touch-target"
              size="lg"
              onClick={goToLaudo}
              disabled={updateInspection.isPending}
            >
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
      <InspectionWizardShell
        currentStep={3}
        inspectionId={id}
        showDraftBanner={inspection?.status === InspectionStatus.DRAFT}
        draftExpiresAt={inspection?.draft_expires_at}
      >
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
            Toque no status. Observações apenas em itens com apontamentos. Parecer ao final.
          </p>
        </div>
      </div>
      {checklistContent}
    </div>
  );
}
