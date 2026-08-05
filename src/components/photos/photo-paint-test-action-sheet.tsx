import { useState } from "react";
import { Camera, ImageIcon, Paintbrush, Ruler, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PAINT_TEST_METHOD_OPTIONS,
  type PaintTestMethod,
} from "@/lib/photos/quadros-portas";
import { cn } from "@/lib/utils";

type PhotoPaintTestActionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName?: string;
  onTakePhoto: (method: PaintTestMethod) => void;
  onPickGallery: (method: PaintTestMethod) => void;
};

export function PhotoPaintTestActionSheet({
  open,
  onOpenChange,
  categoryName,
  onTakePhoto,
  onPickGallery,
}: PhotoPaintTestActionSheetProps) {
  const [method, setMethod] = useState<PaintTestMethod>("CANETA_TESTE");

  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 p-0 sm:rounded-2xl">
        <DialogHeader className="space-y-1 border-b border-border/60 px-5 py-4 text-left">
          <DialogTitle className="text-base">Teste de pintura</DialogTitle>
          {categoryName && <DialogDescription>{categoryName}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Ferramenta utilizada</p>
            <div className="grid grid-cols-1 gap-2">
              {PAINT_TEST_METHOD_OPTIONS.map((option) => {
                const isSelected = method === option.value;
                const Icon = option.value === "CANETA_TESTE" ? Paintbrush : Ruler;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMethod(option.value)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border-2 px-3 py-3 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/30",
                    )}
                  >
                    <Icon
                      className={cn(
                        "mt-0.5 size-5 shrink-0",
                        isSelected ? "text-primary" : "text-muted-foreground",
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Button
              type="button"
              className="h-11 justify-start gap-3 rounded-xl px-4 text-base font-normal"
              onClick={() => {
                onTakePhoto(method);
                close();
              }}
            >
              <Camera className="size-5" aria-hidden />
              Tirar foto
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 justify-start gap-3 rounded-xl px-4 text-base font-normal"
              onClick={() => {
                onPickGallery(method);
                close();
              }}
            >
              <ImageIcon className="size-5" aria-hidden />
              Selecionar da galeria
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 justify-start gap-3 rounded-xl px-4 text-base font-normal text-muted-foreground"
              onClick={close}
            >
              <X className="size-5" aria-hidden />
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
