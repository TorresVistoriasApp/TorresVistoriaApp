import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LaudoReviewPanel } from "@/modules/torres-vistoria/components/laudo/laudo-review-panel";
import { getLaudoBlockerMessages, buildLaudoReadiness } from "@/modules/torres-vistoria/components/laudo/laudo-readiness";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { useCompanyContext } from "@/core/tenant/company-context";
import { useInspectionContext } from "@/modules/torres-vistoria/hooks/use-inspection-context";
import { useToast } from "@/shared/hooks/use-toast";
import { Button } from "@/shared/ui/button";
import {
  InspectionWizardShell,
  WizardNavButtons,
} from "@/modules/torres-vistoria/components/vistoria/inspection-wizard-shell";
import { pdfService } from "@/modules/torres-vistoria/services/pdf-service";
import { companyToLaudoCompany, inspectorToLaudoInspector } from "@/modules/torres-vistoria/domain/laudo/laudo-context";
import { ArrowLeft } from "lucide-react";
import { ROUTES, withNewInspectionFlow } from "@/config/routes";

const FIX_ROUTES: Record<string, (id: string) => string> = {
  dados: (id) => `${ROUTES.inspectionChecklist(id)}#avaliacao-identificacao`,
  photos: (id) => ROUTES.inspectionPhotos(id),
  checklist: (id) => `${ROUTES.inspectionChecklist(id)}#avaliacao-checklist`,
  opinion: (id) => `${ROUTES.inspectionChecklist(id)}#checklist-parecer`,
  notes: (id) => `${ROUTES.inspectionChecklist(id)}#checklist-parecer`,
};

export function InspectionReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWizardFlow = searchParams.get("fluxo") === "nova";
  const {
    inspectionId,
    inspection,
    checklist,
    photos,
    isLoadingAny: isLoading,
  } = useInspectionContext();
  const { company, settings } = useCompanyContext();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const laudoCompany = useMemo(() => companyToLaudoCompany(company), [company]);
  const laudoInspector = useMemo(
    () => inspectorToLaudoInspector(inspection?.inspector),
    [inspection?.inspector],
  );

  const handleGenerate = async () => {
    if (!inspection) return;
    const blockers = getLaudoBlockerMessages(buildLaudoReadiness(inspection, checklist, photos));
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

  const handleFixItem = (itemId: string) => {
    const buildPath = FIX_ROUTES[itemId];
    if (!buildPath) return;
    const path = buildPath(inspectionId);
    navigate(isWizardFlow ? withNewInspectionFlow(path) : path);
  };

  const handleFinish = () => navigate(ROUTES.inspections);

  if (isLoading || !inspection) {
    return <LoadingSpinner label="Carregando laudo..." />;
  }

  const reviewPanel = (
    <LaudoReviewPanel
      inspection={inspection}
      checklist={checklist}
      photos={photos}
      company={laudoCompany}
      settings={settings}
      inspector={laudoInspector}
      verificationCode={verificationCode}
      generating={generating}
      onGenerate={() => void handleGenerate()}
      onFixItem={handleFixItem}
      onFinish={handleFinish}
      showFinishAction={!isWizardFlow}
    />
  );

  if (isWizardFlow) {
    return (
      <InspectionWizardShell
        currentStep={3}
        inspectionId={inspectionId}
        title="Revisão e emissão do laudo"
        showDraftBanner={false}
      >
        <div className="space-y-3">
          {reviewPanel}
          <WizardNavButtons
            onBack={() => navigate(withNewInspectionFlow(ROUTES.inspectionChecklist(inspectionId)))}
            onNext={handleFinish}
            nextLabel={verificationCode ? "Concluir vistoria" : "Salvar e sair"}
            showBack
          />
        </div>
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
          onClick={() => navigate(ROUTES.inspection(inspectionId))}
          aria-label="Voltar para vistoria"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold md:text-xl">Revisão e emissão do laudo</h1>
          <p className="text-xs text-muted-foreground">
            Confira os dados e gere o PDF profissional.
          </p>
        </div>
      </div>
      {reviewPanel}
    </div>
  );
}
