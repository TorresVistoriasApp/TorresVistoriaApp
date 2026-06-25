import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { PhotoSlotGrid } from "@/components/photos/photo-slot-grid";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  InspectionWizardShell,
  WizardNavButtons,
} from "@/components/vistoria/inspection-wizard-shell";
import { useInspectionPhotos, useUploadPhoto } from "@/hooks/use-photos";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ROUTES, withNewInspectionFlow } from "@/lib/constants";

export function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWizardFlow = searchParams.get("fluxo") === "nova";
  const { data: photos = [], isLoading } = useInspectionPhotos(id);
  const upload = useUploadPhoto(id!);
  const { toast } = useToast();
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);

  const handleUpload = async (file: File, category: string) => {
    setUploadingCategory(category);
    try {
      let latitude: number | null = null;
      let longitude: number | null = null;
      if ("geolocation" in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }),
          );
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        } catch {
          /* opcional */
        }
      }
      await upload.mutateAsync({ file, category, latitude, longitude });
      toast("Foto enviada");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploadingCategory(null);
    }
  };

  const goToChecklist = () => {
    if (!id) return;
    const path = ROUTES.inspectionChecklist(id);
    navigate(isWizardFlow ? withNewInspectionFlow(path) : path);
  };

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Toque em cada seção para enviar as evidências obrigatórias, incluindo os 13 pontos de pintura.
        </p>
        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          {photos.length} enviadas
        </span>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Carregando fotos..." />
      ) : (
        <PhotoSlotGrid
          photos={photos}
          uploading={upload.isPending}
          uploadingCategory={uploadingCategory}
          onUpload={handleUpload}
        />
      )}

      {isWizardFlow ? (
        <WizardNavButtons
          onBack={() => id && navigate(withNewInspectionFlow(ROUTES.inspectionEdit(id)))}
          onNext={goToChecklist}
          nextLabel="Continuar para checklist"
        />
      ) : (
        <Button className="w-full touch-target" size="lg" onClick={goToChecklist}>
          <ClipboardList className="mr-2 h-4 w-4" />
          Continuar para checklist
        </Button>
      )}
    </div>
  );

  if (isWizardFlow) {
    return (
      <InspectionWizardShell currentStep={2} inspectionId={id}>
        {content}
      </InspectionWizardShell>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-1 shrink-0"
          onClick={() => id && navigate(ROUTES.inspection(id))}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title="Fotos da vistoria"
          description="Passo 2 de 4. Preencha cada molde com a foto correspondente."
        />
      </div>
      {content}
    </div>
  );
}
