import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Car,
  FileText as FileTextIcon,
  Gauge,
  Layers,
  LayoutDashboard,
  Plus,
  Scan,
  Tag,
  Wrench,
} from "lucide-react";
import { OPTIONAL_PHOTO_CATEGORIES, PAINT_PHOTO_CATEGORIES, PHOTO_CATEGORIES } from "@/lib/constants";
import { PHOTO_CATEGORY_LABELS } from "@/components/photos/photo-categories";
import type { InspectionPhoto } from "@/services/photo-service";
import { cn } from "@/lib/utils";
import { CheckCircle2, Camera, ImagePlus } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  FRENTE_45_DIREITA: Car,
  FRENTE_45_ESQUERDA: Car,
  TRASEIRA_45_DIREITA: Car,
  TRASEIRA_45_ESQUERDA: Car,
  LATERAL_DIREITA: Car,
  LATERAL_ESQUERDA: Car,
  PLACA_DIANTEIRA: Tag,
  PLACA_TRASEIRA: Tag,
  MOTOR: Wrench,
  MOTOR_NUMERO: Wrench,
  CHASSI: Layers,
  PAINEL: LayoutDashboard,
  HODOMETRO: Gauge,
  ESTRUTURA_DIANTEIRA: Layers,
  ESTRUTURA_TRASEIRA: Layers,
  CAIXA_AR: Layers,
  ASSOALHO_PORTA_MALAS: Layers,
  VIDROS: Scan,
  ETIQUETAS: Tag,
  INTERIOR: LayoutDashboard,
  CINTOS_AIRBAGS: AlertTriangle,
  DOCUMENTOS: FileTextIcon,
  DANOS: AlertTriangle,
  PINTURA_CAPO: Car,
  PINTURA_TETO: Car,
  PINTURA_TAMPA_PORTA_MALAS: Car,
  PINTURA_PARALAMA_DIANTEIRO_ESQUERDO: Car,
  PINTURA_PORTA_DIANTEIRA_ESQUERDA: Car,
  PINTURA_PORTA_TRASEIRA_ESQUERDA: Car,
  PINTURA_TRASEIRA_ESQUERDA: Car,
  PINTURA_TRASEIRA_DIREITA: Car,
  PINTURA_PORTA_TRASEIRA_DIREITA: Car,
  PINTURA_PORTA_DIANTEIRA_DIREITA: Car,
  PINTURA_PARALAMA_DIANTEIRO_DIREITO: Car,
  PINTURA_PARACHOQUE_DIANTEIRO: Car,
  PINTURA_PARACHOQUE_TRASEIRO: Car,
  EXTRAS: Plus,
};

const CATEGORY_HINTS: Record<string, string> = {
  FRENTE_45_DIREITA: "Ângulo frontal direito",
  FRENTE_45_ESQUERDA: "Ângulo frontal esquerdo",
  TRASEIRA_45_DIREITA: "Ângulo traseiro direito",
  TRASEIRA_45_ESQUERDA: "Ângulo traseiro esquerdo",
  LATERAL_DIREITA: "Lateral passageiro",
  LATERAL_ESQUERDA: "Lateral motorista",
  PLACA_DIANTEIRA: "Placa dianteira legível",
  PLACA_TRASEIRA: "Placa traseira e lacre",
  MOTOR: "Compartimento do motor",
  MOTOR_NUMERO: "Numeração do motor",
  CHASSI: "Numeração do chassi",
  PAINEL: "Painel e instrumentos",
  HODOMETRO: "Quilometragem visível",
  ESTRUTURA_DIANTEIRA: "Longarinas e painel dianteiro",
  ESTRUTURA_TRASEIRA: "Longarinas e painel traseiro",
  CAIXA_AR: "Soleiras e caixas de ar",
  ASSOALHO_PORTA_MALAS: "Assoalho, estepe e porta-malas",
  VIDROS: "Vidros e etiquetas",
  ETIQUETAS: "Etiquetas de identificação",
  INTERIOR: "Bancos, acabamento e comandos",
  CINTOS_AIRBAGS: "Cintos, airbags e segurança",
  DOCUMENTOS: "Opcional. CRLV, CRV, ATPV-e",
  DANOS: "Avarias encontradas",
  PINTURA_CAPO: "Evidência do capô",
  PINTURA_TETO: "Evidência do teto",
  PINTURA_TAMPA_PORTA_MALAS: "Evidência da tampa do porta-malas",
  PINTURA_PARALAMA_DIANTEIRO_ESQUERDO: "Evidência do paralama dianteiro esquerdo",
  PINTURA_PORTA_DIANTEIRA_ESQUERDA: "Evidência da porta dianteira esquerda",
  PINTURA_PORTA_TRASEIRA_ESQUERDA: "Evidência da porta traseira esquerda",
  PINTURA_TRASEIRA_ESQUERDA: "Evidência da traseira esquerda",
  PINTURA_TRASEIRA_DIREITA: "Evidência da traseira direita",
  PINTURA_PORTA_TRASEIRA_DIREITA: "Evidência da porta traseira direita",
  PINTURA_PORTA_DIANTEIRA_DIREITA: "Evidência da porta dianteira direita",
  PINTURA_PARALAMA_DIANTEIRO_DIREITO: "Evidência do paralama dianteiro direito",
  PINTURA_PARACHOQUE_DIANTEIRO: "Evidência do para-choque dianteiro",
  PINTURA_PARACHOQUE_TRASEIRO: "Evidência do para-choque traseiro",
  EXTRAS: "Opcional. Quantas fotos forem necessárias",
};

const OPTIONAL_CATEGORIES = new Set<string>(OPTIONAL_PHOTO_CATEGORIES);
const DOCUMENT_CATEGORY = "DOCUMENTOS";
const EXTRA_CATEGORY = "EXTRAS";
const PAINT_CATEGORIES = new Set<string>(PAINT_PHOTO_CATEGORIES);

const PHOTO_SECTIONS = [
  {
    title: "Fotos obrigatórias e evidências",
    description: "Registros principais da vistoria cautelar.",
    categories: PHOTO_CATEGORIES.filter(
      (category) =>
        category !== DOCUMENT_CATEGORY &&
        category !== EXTRA_CATEGORY &&
        !PAINT_CATEGORIES.has(category),
    ),
  },
  {
    title: "Pintura",
    description: "Envie uma foto de evidência para cada ponto de pintura.",
    categories: [...PAINT_PHOTO_CATEGORIES],
  },
  {
    title: "Documentação do veículo",
    description: "Opcional. CRLV, CRV, ATPV-e ou outros documentos do veículo.",
    categories: [DOCUMENT_CATEGORY],
  },
  {
    title: "Fotos extras",
    description: "Opcional. Adicione quantas fotos complementares forem necessárias.",
    categories: [EXTRA_CATEGORY],
  },
] as const;

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
  const photosByCategory = photos.reduce<Record<string, InspectionPhoto[]>>((acc, photo) => {
    (acc[photo.category] ??= []).push(photo);
    return acc;
  }, {});
  const filled = PHOTO_CATEGORIES.filter((category) => photosByCategory[category]?.length).length;
  const total = PHOTO_CATEGORIES.length;
  const progress = Math.round((filled / total) * 100);

  const handleSlotClick = (category: string) => {
    if (uploading) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.multiple = true;
    input.onchange = () => {
      Array.from(input.files ?? []).forEach((file) => onUpload(file, category));
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
              Toque em cada seção para adicionar uma ou mais fotos de evidência
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">
              {filled}/{total}
            </p>
            <p className="text-xs text-muted-foreground">
              {photos.length} foto{photos.length === 1 ? "" : "s"}, {progress}% das seções
            </p>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full gradient-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {PHOTO_SECTIONS.map((section) => (
        <section key={section.title} className="space-y-3">
          <div>
            <h3 className="text-sm font-bold">{section.title}</h3>
            <p className="text-xs text-muted-foreground">{section.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {section.categories.map((category) => {
          const categoryPhotos = photosByCategory[category] ?? [];
          const photo = categoryPhotos[categoryPhotos.length - 1];
          const Icon = CATEGORY_ICONS[category] ?? Camera;
          const label = PHOTO_CATEGORY_LABELS[category] ?? category;
          const hint = CATEGORY_HINTS[category] ?? "";
          const isUploading = uploading && uploadingCategory === category;
          const isOptional = OPTIONAL_CATEGORIES.has(category);

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
                      {categoryPhotos.length > 1 ? (
                        <span className="text-xs font-bold">{categoryPhotos.length}</span>
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary transition-transform group-hover:scale-105">
                      <Icon className="h-7 w-7" strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary/70">
                      <ImagePlus className="h-3 w-3" />
                      {isOptional ? "Adicionar opcional" : "Adicionar evidência"}
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
                <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
                  {categoryPhotos.length > 0
                    ? `${categoryPhotos.length} foto${categoryPhotos.length === 1 ? "" : "s"}, ${hint}`
                    : hint}
                </p>
                {isOptional && (
                  <p className="mt-1 text-[10px] font-semibold text-primary">Opcional. Permite múltiplos anexos.</p>
                )}
              </div>
            </button>
          );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
