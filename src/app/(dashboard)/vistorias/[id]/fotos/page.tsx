import { useNavigate, useParams } from "react-router-dom";
import { PhotoUpload } from "@/components/photos/photo-upload";
import { PhotoGallery } from "@/components/photos/photo-gallery";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useInspectionPhotos, useUploadPhoto } from "@/hooks/use-photos";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardList } from "lucide-react";

export function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: photos = [], isLoading } = useInspectionPhotos(id);
  const upload = useUploadPhoto(id!);
  const { toast } = useToast();

  const handleUpload = async (file: File, category: string) => {
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
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="touch-target"
            onClick={() => navigate(`/vistorias/${id}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Fotos</h1>
            <p className="text-xs text-muted-foreground">Passo 2 de 3</p>
          </div>
        </div>
        <span className="text-sm text-muted-foreground">{photos.length} fotos</span>
      </div>

      <PhotoUpload onUpload={handleUpload} uploading={upload.isPending} />

      {upload.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex items-center gap-3 rounded-lg bg-background p-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm font-medium">Comprimindo e enviando...</p>
          </div>
        </div>
      )}

      {isLoading ? <LoadingSpinner /> : <PhotoGallery photos={photos} />}

      <Button
        className="w-full touch-target"
        onClick={() => navigate(`/vistorias/${id}/checklist`)}
      >
        <ClipboardList className="mr-2 h-4 w-4" />
        Continuar para checklist
      </Button>
    </div>
  );
}
