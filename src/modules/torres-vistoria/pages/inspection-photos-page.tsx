import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { PhotoSlotGrid } from "@/modules/torres-vistoria/components/photos/photo-slot-grid";
import { PageHeader } from "@/shared/components/page-header";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import {
  InspectionWizardShell,
  WizardNavButtons,
} from "@/modules/torres-vistoria/components/vistoria/inspection-wizard-shell";
import {
  useDeletePhoto,
  useUploadPhoto,
} from "@/modules/torres-vistoria/hooks/use-photos";
import { useInspectionContext } from "@/modules/torres-vistoria/hooks/use-inspection-context";
import { useToast } from "@/shared/hooks/use-toast";
import { Button } from "@/shared/ui/button";
import { ROUTES, withNewInspectionFlow } from "@/config/routes";
import { createPhotoCaptureContext } from "@/modules/torres-vistoria/domain/photos/photo-capture-visibility";
import { computeCaptureProgress } from "@/modules/torres-vistoria/domain/photos/photo-progress";
import { PHOTO_REQUIREMENTS_ENABLED } from "@/modules/torres-vistoria/domain/photos/photo-requirements-flag";
import type { PhotoCaptureMetadata } from "@/modules/torres-vistoria/domain/photos/types";
import { InspectionStatus } from "@/modules/torres-vistoria/domain/enums";
import type { InspectionPhoto } from "@/modules/torres-vistoria/services/photo-service";

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

export function InspectionPhotosPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWizardFlow = searchParams.get("fluxo") === "nova";
  const { inspectionId, inspection, photos, isLoadingPhotos: isLoading } = useInspectionContext();
  const upload = useUploadPhoto(inspectionId);
  const deletePhoto = useDeletePhoto(inspectionId);
  const { toast } = useToast();
  const geoRef = useRef<GeoCoords | null>(null);

  const captureContext = useMemo(
    () => createPhotoCaptureContext(inspection),
    [inspection],
  );
  const captureProgress = useMemo(
    () => computeCaptureProgress(photos, captureContext),
    [photos, captureContext],
  );

  useEffect(() => {
    prefetchGeoCoords((coords) => {
      geoRef.current = coords;
    });
  }, []);

  const handleUpload = useCallback(
    (file: File, category: string, metadata?: Partial<PhotoCaptureMetadata>) => {
      const coords = geoRef.current;

      upload.mutate(
        {
          file,
          category,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
          metadata,
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

  const goToAvaliacao = () => {
    if (!captureProgress.canProceed) {
      toast("Conclua todas as fotografias obrigatórias antes de continuar.");
      return;
    }
    const path = ROUTES.inspectionChecklist(inspectionId);
    navigate(isWizardFlow ? withNewInspectionFlow(path) : path);
  };

  const content = (
    <div className="w-full space-y-5 sm:space-y-6">
      {isLoading ? (
        <LoadingSpinner label="Carregando fotos..." />
      ) : (
        <PhotoSlotGrid
          photos={photos}
          inspection={inspection}
          onUpload={handleUpload}
          onDelete={handleDelete}
          onPickError={(message) => toast(message)}
        />
      )}

      {isWizardFlow ? (
        <WizardNavButtons
          onBack={() => navigate(ROUTES.inspections)}
          onNext={goToAvaliacao}
          nextLabel="Continuar para avaliação técnica"
          nextDisabled={!captureProgress.canProceed}
          showBack
        />
      ) : (
        <Button
          className="w-full touch-target"
          size="lg"
          onClick={goToAvaliacao}
          disabled={!captureProgress.canProceed}
        >
          <ClipboardList className="mr-2 h-4 w-4" />
          Continuar para avaliação técnica
        </Button>
      )}
    </div>
  );

  if (isWizardFlow) {
    return (
      <InspectionWizardShell
        currentStep={1}
        inspectionId={inspectionId}
        title="Captura das fotografias"
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
          onClick={() => navigate(ROUTES.inspection(inspectionId))}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title="Fotos e evidências"
          description={
            PHOTO_REQUIREMENTS_ENABLED
              ? "Passo 1 de 3. Capture cada fotografia seguindo o guia visual. Todas as obrigatórias devem ser concluídas."
              : "Passo 1 de 3. Capture cada fotografia seguindo o guia visual."
          }
        />
      </div>
      {content}
    </div>
  );
}
