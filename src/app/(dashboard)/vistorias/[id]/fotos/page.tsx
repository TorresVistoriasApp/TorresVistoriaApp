import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { computeCaptureProgress, PhotoSlotGrid } from "@/components/photos/photo-slot-grid";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  InspectionWizardShell,
  WizardNavButtons,
} from "@/components/vistoria/inspection-wizard-shell";
import {
  useDeletePhoto,
  useInspectionPhotos,
  useUploadPhoto,
} from "@/hooks/use-photos";
import { useInspection } from "@/hooks/use-inspection";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ROUTES, withNewInspectionFlow } from "@/lib/constants";
import { InspectionStatus } from "@/lib/enums";
import type { InspectionPhoto } from "@/services/photo-service";

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
  const { data: inspection } = useInspection(id);
  const { data: photos = [], isLoading } = useInspectionPhotos(id);
  const upload = useUploadPhoto(id!);
  const deletePhoto = useDeletePhoto(id!);
  const { toast } = useToast();
  const geoRef = useRef<GeoCoords | null>(null);

  const captureProgress = useMemo(() => computeCaptureProgress(photos), [photos]);

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
            const message =
              err instanceof Error
                ? err.message
                : "Não foi possível enviar a foto. Tente outra imagem ou use a câmera.";
            toast(message);
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

  const handleDelete = useCallback(
    (photo: InspectionPhoto) => {
      if (photo.id.startsWith("pending-")) return;
      deletePhoto.mutate(
        { id: photo.id, storagePath: photo.storage_path },
        {
          onError: (err) => {
            toast(err instanceof Error ? err.message : "Erro ao remover foto");
          },
        },
      );
    },
    [deletePhoto, toast],
  );

  const goToChecklist = () => {
    if (!captureProgress.canProceed) {
      toast("Conclua todas as fotografias obrigatórias antes de continuar.");
      return;
    }
    if (!id) return;
    const path = ROUTES.inspectionChecklist(id);
    navigate(isWizardFlow ? withNewInspectionFlow(path) : path);
  };

  const content = (
    <div className="w-full space-y-5 sm:space-y-6">
      {isLoading ? (
        <LoadingSpinner label="Carregando fotos..." />
      ) : (
        <PhotoSlotGrid photos={photos} onUpload={handleUpload} onDelete={handleDelete} />
      )}

      {isWizardFlow ? (
        <WizardNavButtons
          onBack={() => id && navigate(withNewInspectionFlow(ROUTES.inspectionEdit(id)))}
          onNext={goToChecklist}
          nextLabel="Continuar para checklist"
          nextDisabled={!captureProgress.canProceed}
        />
      ) : (
        <Button
          className="w-full touch-target"
          size="lg"
          onClick={goToChecklist}
          disabled={!captureProgress.canProceed}
        >
          <ClipboardList className="mr-2 h-4 w-4" />
          Continuar para checklist
        </Button>
      )}
    </div>
  );

  if (isWizardFlow) {
    return (
      <InspectionWizardShell
        currentStep={2}
        inspectionId={id}
        showDraftBanner={inspection?.status === InspectionStatus.DRAFT}
        draftExpiresAt={inspection?.draft_expires_at}
      >
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
          title="Fotos e evidências"
          description="Passo 2 de 4. Capture cada fotografia seguindo o guia visual. Todas as obrigatórias devem ser concluídas."
        />
      </div>
      {content}
    </div>
  );
}
