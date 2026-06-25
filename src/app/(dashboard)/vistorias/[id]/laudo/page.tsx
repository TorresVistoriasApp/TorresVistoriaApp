import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PdfDownloadButton } from "@/components/pdf/pdf-download-button";
import { PdfPreview } from "@/components/pdf/pdf-preview";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useInspection, useInspectionChecklist } from "@/hooks/use-inspection";
import { useCompany, useCompanySettings } from "@/hooks/use-company";
import { useInspectionPhotos } from "@/hooks/use-photos";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { InspectionWizardShell } from "@/components/vistoria/inspection-wizard-shell";
import { validateChecklistCompletion } from "@/components/forms/checklist-form";
import { pdfService } from "@/services/pdf-service";
import { PHOTO_CATEGORY_LABELS } from "@/components/photos/photo-categories";
import { companyToLaudoCompany, inspectorToLaudoInspector } from "@/lib/laudo/laudo-context";
import { ArrowLeft, CheckCircle, Download, FileText, ShieldAlert } from "lucide-react";
import { MANDATORY_PHOTO_CATEGORIES, ROUTES } from "@/lib/constants";

export function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWizardFlow = searchParams.get("fluxo") === "nova";
  const { data: inspection, isLoading: loadingInspection } = useInspection(id);
  const { data: checklist = [], isLoading: loadingChecklist } = useInspectionChecklist(id);
  const { data: photos = [], isLoading: loadingPhotos } = useInspectionPhotos(id);
  const { data: company, isLoading: loadingCompany } = useCompany(inspection?.company_id);
  const { data: settings, isLoading: loadingSettings } = useCompanySettings(inspection?.company_id);
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const laudoCompany = useMemo(() => companyToLaudoCompany(company), [company]);
  const laudoInspector = useMemo(
    () => inspectorToLaudoInspector(inspection?.inspector),
    [inspection?.inspector],
  );

  const handleGenerate = async () => {
    if (!id || !inspection) return;
    const blockers = getLaudoBlockers(inspection, checklist, photos);
    if (blockers.length > 0) {
      toast(blockers[0]);
      return;
    }

    setGenerating(true);
    try {
      const result = await pdfService.registerProfessionalLaudo({
        inspection,
        checklist,
        photos,
        company: laudoCompany,
        settings,
        inspector: laudoInspector,
      });
      setVerificationCode(result.verificationCode);
      toast("Laudo profissional registrado e baixado com sucesso");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao gerar laudo");
    } finally {
      setGenerating(false);
    }
  };

  if (loadingInspection || loadingChecklist || loadingPhotos || loadingCompany || loadingSettings || !inspection) {
    return <LoadingSpinner />;
  }

  const blockers = getLaudoBlockers(inspection, checklist, photos);
  const content = (
    <div className="space-y-4">
      {verificationCode && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">
              Laudo registrado
            </p>
            {verificationCode && (
              <p className="text-xs text-green-600">Código: {verificationCode}</p>
            )}
          </div>
        </div>
      )}

      {blockers.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <ShieldAlert className="h-4 w-4" />
            Pendências antes do laudo profissional
          </div>
          <ul className="list-inside list-disc space-y-1">
            {blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </div>
      )}

      <PdfPreview
        inspection={inspection}
        checklist={checklist}
        photos={photos}
        company={laudoCompany}
        settings={settings}
        inspector={laudoInspector}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          className="touch-target h-12"
          onClick={() => void handleGenerate()}
          disabled={generating || blockers.length > 0}
        >
          {generating ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <>
              <FileText className="mr-2 h-5 w-5" />
              Gerar, registrar e baixar
            </>
          )}
        </Button>
        <PdfDownloadButton
          inspection={inspection}
          checklist={checklist}
          photos={photos}
          company={laudoCompany}
          settings={settings}
          inspector={laudoInspector}
        />
      </div>

      <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
        <Download className="mr-1 inline h-3.5 w-3.5" />
        O laudo usa os dados de Configurações: razão social, CPF/CNPJ, endereço da empresa e nome do
        vistoriador responsável pela vistoria.
      </div>

      <Button variant="ghost" className="w-full touch-target" onClick={() => navigate(ROUTES.inspections)}>
        Voltar para lista
      </Button>
    </div>
  );

  if (isWizardFlow) {
    return (
      <InspectionWizardShell currentStep={4} inspectionId={id} title="Revisão e laudo">
        {content}
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
          onClick={() => id && navigate(ROUTES.inspection(id))}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Laudo profissional</h1>
      </div>
      {content}
    </div>
  );
}

function getLaudoBlockers(
  inspection: NonNullable<ReturnType<typeof useInspection>["data"]>,
  checklist: NonNullable<ReturnType<typeof useInspectionChecklist>["data"]>,
  photos: NonNullable<ReturnType<typeof useInspectionPhotos>["data"]>,
): string[] {
  const blockers: string[] = [];
  const checklistStatus = validateChecklistCompletion(checklist);
  if (checklistStatus.pendingCount > 0) {
    blockers.push(`Checklist com ${checklistStatus.pendingCount} item(ns) pendente(s).`);
  }
  if (checklistStatus.missingNotesCount > 0) {
    blockers.push(`${checklistStatus.missingNotesCount} item(ns) não conforme(s) sem observação.`);
  }
  if (!inspection.opinion) {
    blockers.push("Parecer técnico ainda não foi selecionado.");
  }

  const available = new Set(photos.map((photo) => photo.category));
  const missingPhotos = MANDATORY_PHOTO_CATEGORIES.filter((category) => !available.has(category));
  if (missingPhotos.length > 0) {
    const labels = missingPhotos
      .map((category) => PHOTO_CATEGORY_LABELS[category] ?? category)
      .join(", ");
    blockers.push(`Fotos obrigatórias ausentes: ${labels}.`);
  }

  return blockers;
}
