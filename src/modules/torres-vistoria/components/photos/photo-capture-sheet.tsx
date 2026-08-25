import { Camera, Eye, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { PhotoVisualGuidePanel } from "@/modules/torres-vistoria/components/photos/photo-visual-guide";
import type { PhotoCategoryDefinition } from "@/modules/torres-vistoria/domain/photos/types";
import type { InspectionPhoto } from "@/modules/torres-vistoria/services/photo-service";
import { resolveVisualGuide } from "@/modules/torres-vistoria/domain/photos/visual-guides";
import { isPhotoRequirementActive } from "@/modules/torres-vistoria/domain/photos/photo-requirements-flag";

interface PhotoCaptureSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: PhotoCategoryDefinition;
  photos: InspectionPhoto[];
  onCapture: () => void;
  onRetake: () => void;
  onView: () => void;
  isUploading?: boolean;
}

export function PhotoCaptureSheet({
  open,
  onOpenChange,
  category,
  photos,
  onCapture,
  onRetake,
  onView,
  isUploading,
}: PhotoCaptureSheetProps) {
  const latestPhoto = photos[photos.length - 1];
  const hasPhoto = Boolean(latestPhoto?.public_url);
  const guide = category.visualGuide ?? resolveVisualGuide(category.key, category.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {category.name}
            {isPhotoRequirementActive(category.required) && (
              <span className="ui-chip-warning uppercase">
                Obrigatória
              </span>
            )}
          </DialogTitle>
          <DialogDescription>{category.description}</DialogDescription>
        </DialogHeader>

        <PhotoVisualGuidePanel
          guide={guide}
          categoryName={category.name}
        />

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {hasPhoto ? (
            <>
              <Button type="button" variant="outline" className="touch-target w-full sm:w-auto" onClick={onView}>
                <Eye className="mr-2 size-4" />
                Visualizar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="touch-target w-full sm:w-auto"
                onClick={onRetake}
                disabled={isUploading}
              >
                <RotateCcw className="mr-2 size-4" />
                Refazer
              </Button>
            </>
          ) : (
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={onCapture}
              disabled={isUploading}
            >
              {isUploading ? (
                "Enviando..."
              ) : (
                <>
                  <Camera className="mr-2 size-4" />
                  Capturar
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
