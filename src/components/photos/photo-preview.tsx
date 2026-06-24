import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PHOTO_CATEGORY_LABELS } from "@/components/photos/photo-categories";

type PhotoPreviewProps = {
  url: string;
  category: string;
  alt?: string;
};

export function PhotoPreview({ url, category, alt }: PhotoPreviewProps) {
  const [open, setOpen] = useState(false);
  const label = PHOTO_CATEGORY_LABELS[category] ?? category.replace(/_/g, " ");

  return (
    <>
      <button
        type="button"
        className="block w-full overflow-hidden rounded-lg border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => setOpen(true)}
        aria-label={`Ampliar foto ${label}`}
      >
        <img src={url} alt={alt ?? label} className="aspect-square w-full object-cover" loading="lazy" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <Button
            variant="ghost"
            size="icon"
            className="touch-target absolute right-4 top-4 text-white hover:bg-white/20"
            onClick={() => setOpen(false)}
            aria-label="Fechar preview"
          >
            <X className="h-5 w-5" />
          </Button>
          <figure className="max-h-[90vh] max-w-full">
            <img src={url} alt={alt ?? label} className="max-h-[85vh] max-w-full rounded-lg object-contain" />
            <figcaption className="mt-2 text-center text-sm text-white">{label}</figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
