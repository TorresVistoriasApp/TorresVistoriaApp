import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { LaudoReviewPanel } from "@/components/laudo/laudo-review-panel";
import { getLaudoBlockerMessages, buildLaudoReadiness } from "@/components/laudo/laudo-readiness";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useInspection, useInspectionChecklist } from "@/hooks/use-inspection";
import { useCompany, useCompanySettings } from "@/hooks/use-company";
import { useInspectionPhotos } from "@/hooks/use-photos";
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

  const isLoading =
    loadingInspection || loadingChecklist || loadingPhotos || loadingCompany || loadingSettings;

  const handleGenerate = async () => {
    if (!id || !inspection) return;
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
    if (!id) return;
    const routes: Record<string, string> = {
      checklist: ROUTES.inspectionChecklist(id),
      photos: ROUTES.inspectionPhotos(id),
      opinion: ROUTES.inspectionEdit(id),
      notes: ROUTES.inspectionEdit(id),
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
      <InspectionWizardShell currentStep={4} inspectionId={id} title="Revisão e laudo">
        <div className="space-y-4 md:space-y-6">
          {reviewPanel}
          <WizardNavButtons
            onBack={() => id && navigate(withNewInspectionFlow(ROUTES.inspectionChecklist(id)))}
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
          onClick={() => id && navigate(ROUTES.inspection(id))}
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
