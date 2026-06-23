import { useParams } from "react-router-dom";
import { PhotoUpload } from "@/components/photos/photo-upload";
import { PhotoGallery } from "@/components/photos/photo-gallery";
import { MobileBackButton } from "@/components/shared/mobile-back-button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useInspectionPhotos, useUploadPhoto } from "@/hooks/use-photos";
import { useToast } from "@/hooks/use-toast";

export function Page() {
  const { id } = useParams<{ id: string }>();
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
          /* geolocation opcional */
        }
      }
      await upload.mutateAsync({ file, category, latitude, longitude });
      toast("Foto enviada com sucesso");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro no upload — verifique o bucket Storage");
    }
  };

  return (
    <div className="space-y-6">
      <MobileBackButton to={`/vistorias/${id}`} label="Voltar à vistoria" />
      <h1 className="text-2xl font-bold">Fotos da vistoria</h1>
      <PhotoUpload onUpload={handleUpload} uploading={upload.isPending} />
      {isLoading ? <LoadingSpinner /> : <PhotoGallery photos={photos} />}
    </div>
  );
}
