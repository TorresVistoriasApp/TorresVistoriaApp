import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Car,
  Gauge,
  Layers,
  LayoutDashboard,
  Plus,
  Scan,
  Tag,
  Wrench,
} from "lucide-react";
import { PHOTO_CATEGORIES } from "@/lib/constants";
import { PHOTO_CATEGORY_LABELS } from "@/components/photos/photo-categories";
import type { InspectionPhoto } from "@/services/photo-service";
import { cn } from "@/lib/utils";
import { CheckCircle2, Camera, ImagePlus } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  FRENTE_45: Car,
  TRASEIRA_45: Car,
  LATERAL_DIREITA: Car,
  LATERAL_ESQUERDA: Car,
  MOTOR: Wrench,
  CHASSI: Layers,
  PAINEL: LayoutDashboard,
  HODOMETRO: Gauge,
  ESTRUTURA: Layers,
  VIDROS: Scan,
  ETIQUETAS: Tag,
  DANOS: AlertTriangle,
  EXTRAS: Plus,
};

const CATEGORY_HINTS: Record<string, string> = {
  FRENTE_45: "Ângulo frontal 45°",
  TRASEIRA_45: "Ângulo traseiro 45°",
  LATERAL_DIREITA: "Lateral passageiro",
  LATERAL_ESQUERDA: "Lateral motorista",
  MOTOR: "Compartimento do motor",
  CHASSI: "Numeração do chassi",
  PAINEL: "Painel e instrumentos",
  HODOMETRO: "Quilometragem visível",
  ESTRUTURA: "Longarinas e colunas",
  VIDROS: "Vidros e etiquetas",
  ETIQUETAS: "Etiquetas de identificação",
  DANOS: "Avarias encontradas",
  EXTRAS: "Fotos complementares",
};

interface PhotoSlotGridProps {
  photos: InspectionPhoto[];
  uploading?: boolean;
  uploadingCategory?: string | null;
  onUpload: (file: File, category: string) => void;
}

export function PhotoSlotGrid({
  photos,
  uploading,
  uploadingCategory,
  onUpload,
}: PhotoSlotGridProps) {
  const photosByCategory = new Map(photos.map((p) => [p.category, p]));
  const filled = photos.length;
  const total = PHOTO_CATEGORIES.length;
  const progress = Math.round((filled / total) * 100);

  const handleSlotClick = (category: string) => {
    if (uploading) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) onUpload(file, category);
    };
    input.click();
  };

  return (
    <div className="space-y-5">
      <div className="surface p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold">Checklist fotográfico</p>
            <p className="text-xs text-muted-foreground">
              Toque em cada molde para adicionar ou substituir a foto
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">
              {filled}/{total}
            </p>
            <p className="text-xs text-muted-foreground">{progress}% concluído</p>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full gradient-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {PHOTO_CATEGORIES.map((category) => {
          const photo = photosByCategory.get(category);
          const Icon = CATEGORY_ICONS[category] ?? Camera;
          const label = PHOTO_CATEGORY_LABELS[category] ?? category;
          const hint = CATEGORY_HINTS[category] ?? "";
          const isUploading = uploading && uploadingCategory === category;

          return (
            <button
              key={category}
              type="button"
              disabled={uploading}
              onClick={() => handleSlotClick(category)}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-2xl border-2 text-left transition-all duration-200",
                photo
                  ? "border-primary/30 bg-card shadow-soft hover:shadow-elevated"
                  : "border-dashed border-primary/25 bg-primary/[0.03] hover:border-primary/50 hover:bg-primary/[0.06]",
                uploading && !isUploading && "opacity-60",
              )}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {photo?.public_url ? (
                  <>
                    <img
                      src={photo.public_url}
                      alt={label}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-success text-white shadow-md">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary transition-transform group-hover:scale-105">
                      <Icon className="h-7 w-7" strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary/70">
                      <ImagePlus className="h-3 w-3" />
                      Adicionar
                    </div>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
              </div>

              <div className="border-t border-border/60 px-3 py-2.5">
                <p className="text-xs font-bold leading-tight">{label}</p>
                <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">{hint}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
