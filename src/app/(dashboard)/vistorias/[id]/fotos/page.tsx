import { useCallback, useEffect, useRef } from "react";
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

type GeoCoords = { latitude: number; longitude: number };

function prefetchGeoCoords(onReady: (coords: GeoCoords | null) => void) {
  if (!("geolocation" in navigator)) {
    onReady(null);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      onReady({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    },
    () => onReady(null),
    { enableHighAccuracy: false, timeout: 2500, maximumAge: 300_000 },
  );
}

export function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWizardFlow = searchParams.get("fluxo") === "nova";
  const { data: photos = [], isLoading } = useInspectionPhotos(id);
  const upload = useUploadPhoto(id!);
  const { toast } = useToast();
  const geoRef = useRef<GeoCoords | null>(null);

  useEffect(() => {
    prefetchGeoCoords((coords) => {
      geoRef.current = coords;
    });
  }, []);

  const handleUpload = useCallback(
    (file: File, category: string) => {
      const coords = geoRef.current;

      upload.mutate(
        {
          file,
          category,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
        },
        {
          onError: (err) => {
            toast(err instanceof Error ? err.message : "Erro no upload");
          },
        },
      );

      if (!geoRef.current) {
        prefetchGeoCoords((nextCoords) => {
          geoRef.current = nextCoords;
        });
      }
    },
    [toast, upload],
  );

  const goToChecklist = () => {
    if (!id) return;
    const path = ROUTES.inspectionChecklist(id);
    navigate(isWizardFlow ? withNewInspectionFlow(path) : path);
  };

  const content = (
    <div className="w-full space-y-5 sm:space-y-6">
      {isLoading ? (
        <LoadingSpinner label="Carregando fotos..." />
      ) : (
        <PhotoSlotGrid photos={photos} onUpload={handleUpload} />
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
