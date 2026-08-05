import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LaudoReviewPanel } from "@/components/laudo/laudo-review-panel";
import { getLaudoBlockerMessages, buildLaudoReadiness } from "@/components/laudo/laudo-readiness";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useCompanyContext } from "@/app/company-context";
import { useInspectionContext } from "@/hooks/use-inspection-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  InspectionWizardShell,
  WizardNavButtons,
} from "@/components/vistoria/inspection-wizard-shell";
import { pdfService } from "@/services/pdf-service";
import { companyToLaudoCompany, inspectorToLaudoInspector } from "@/lib/laudo/laudo-context";
import { ArrowLeft } from "lucide-react";
import { ROUTES, withNewInspectionFlow } from "@/lib/constants";

export function Page() {
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
    const routes: Record<string, string> = {
      checklist: ROUTES.inspectionChecklist(inspectionId),
      photos: ROUTES.inspectionPhotos(inspectionId),
      opinion: `${ROUTES.inspectionChecklist(inspectionId)}#checklist-parecer`,
      notes: `${ROUTES.inspectionChecklist(inspectionId)}#checklist-parecer`,
    };
    const path = routes[itemId];
    if (!path) return;
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
      <InspectionWizardShell currentStep={4} inspectionId={inspectionId} title="Revisão e laudo">
        <div className="space-y-4 md:space-y-6">
          {reviewPanel}
          <WizardNavButtons
            onBack={() => navigate(withNewInspectionFlow(ROUTES.inspectionChecklist(inspectionId)))}
            onNext={handleFinish}
            nextLabel={verificationCode ? "Concluir vistoria" : "Salvar e sair"}
            nextDisabled={false}
          />
        </div>
      </InspectionWizardShell>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="touch-target"
          onClick={() => navigate(ROUTES.inspection(inspectionId))}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Laudo profissional</h1>
          <p className="text-sm text-muted-foreground">
            Revise, emita e baixe o laudo da vistoria
          </p>
        </div>
      </div>
      {reviewPanel}
    </div>
  );
}
