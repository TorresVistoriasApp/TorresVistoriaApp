import { Camera, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PhotoActionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName?: string;
  onTakePhoto: () => void;
  onPickGallery: () => void;
};

export function PhotoActionSheet({
  open,
  onOpenChange,
  categoryName,
  onTakePhoto,
  onPickGallery,
}: PhotoActionSheetProps) {
  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 p-0 sm:rounded-2xl">
        <DialogHeader className="space-y-1 border-b border-border/60 px-5 py-4 text-left">
          <DialogTitle className="text-base">Adicionar fotografia</DialogTitle>
          {categoryName && (
            <DialogDescription>{categoryName}</DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-col p-2">
          <Button
            type="button"
            variant="ghost"
            className="h-12 justify-start gap-3 rounded-xl px-4 text-base font-normal"
            onClick={() => {
              close();
              onTakePhoto();
            }}
          >
            <Camera className="size-5 text-primary" aria-hidden />
            Tirar foto
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-12 justify-start gap-3 rounded-xl px-4 text-base font-normal"
            onClick={() => {
              close();
              onPickGallery();
            }}
          >
            <ImageIcon className="size-5 text-primary" aria-hidden />
            Selecionar da galeria
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-12 justify-start gap-3 rounded-xl px-4 text-base font-normal text-muted-foreground"
            onClick={close}
          >
            <X className="size-5" aria-hidden />
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
