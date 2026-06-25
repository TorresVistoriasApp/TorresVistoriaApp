import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Car,
  Camera,
  FileText as FileTextIcon,
  Gauge,
  Layers,
  LayoutDashboard,
  Plus,
  Scan,
  Tag,
  Wrench,
} from "lucide-react";
import { FormSectionCard } from "@/components/forms/form-section-card";
import { PHOTO_CATEGORY_LABELS } from "@/components/photos/photo-categories";
import { PhotoSlotFrame } from "@/components/photos/photo-slot-frame";
import { MultiPhotoGallery } from "@/components/photos/multi-photo-gallery";
import { isPendingPhoto } from "@/hooks/use-photos";
import { OPTIONAL_PHOTO_CATEGORIES, PAINT_PHOTO_CATEGORIES, PHOTO_CATEGORIES } from "@/lib/constants";
import type { InspectionPhoto } from "@/services/photo-service";
import { cn } from "@/lib/utils";

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
  DOCUMENTOS: "CRLV, CRV, ATPV-e ou similar",
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
  EXTRAS: "Complementos visuais da vistoria",
};

const MULTI_PHOTO_CATEGORIES = new Set<string>(OPTIONAL_PHOTO_CATEGORIES);
const DOCUMENT_CATEGORY = "DOCUMENTOS";
const EXTRA_CATEGORY = "EXTRAS";
const PAINT_CATEGORIES = new Set<string>(PAINT_PHOTO_CATEGORIES);

const PHOTO_SECTIONS = [
  {
    id: "fotos-evidencias",
    index: 1,
    title: "Evidências do veículo",
    description: "Registros principais exigidos na vistoria cautelar.",
    categories: PHOTO_CATEGORIES.filter(
      (category) =>
        category !== DOCUMENT_CATEGORY &&
        category !== EXTRA_CATEGORY &&
        !PAINT_CATEGORIES.has(category),
    ),
  },
  {
    id: "fotos-pintura",
    index: 2,
    title: "Pintura",
    description: "Envie uma foto de evidência para cada um dos 13 pontos.",
    categories: [...PAINT_PHOTO_CATEGORIES],
  },
  {
    id: "fotos-documentos",
    index: 3,
    title: "Documentação do veículo",
    description: "CRLV, CRV, ATPV-e ou outros documentos. Cada arquivo aparece abaixo para conferência.",
    categories: [DOCUMENT_CATEGORY],
    optional: true,
    collapsible: true,
    defaultOpen: false,
  },
  {
    id: "fotos-extras",
    index: 4,
    title: "Fotos extras",
    description: "Complementos visuais. Cada nova foto aparece abaixo para conferência e entra no laudo PDF.",
    categories: [EXTRA_CATEGORY],
    optional: true,
    collapsible: true,
    defaultOpen: false,
  },
] as const;

type PhotoSectionConfig = {
  id: string;
  index: number;
  title: string;
  description: string;
  categories: readonly string[];
  optional?: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
};

const PHOTO_SECTION_LIST: PhotoSectionConfig[] = PHOTO_SECTIONS.map((section) => ({ ...section }));

interface PhotoSlotGridProps {
  photos: InspectionPhoto[];
  onUpload: (file: File, category: string) => void;
}

function countFilledCategories(
  categories: readonly string[],
  photosByCategory: Record<string, InspectionPhoto[]>,
): number {
  return categories.filter((category) =>
    photosByCategory[category]?.some((photo) => !isPendingPhoto(photo)),
  ).length;
}

function countPhotosInCategories(
  categories: readonly string[],
  photosByCategory: Record<string, InspectionPhoto[]>,
): number {
  return categories.reduce(
    (total, category) =>
      total +
      (photosByCategory[category]?.filter((photo) => !isPendingPhoto(photo)).length ?? 0),
    0,
  );
}

function buildSectionStatus(
  section: PhotoSectionConfig,
  photosByCategory: Record<string, InspectionPhoto[]>,
): string {
  if (section.optional) {
    const count = countPhotosInCategories(section.categories, photosByCategory);
    if (count === 0) return "Nenhuma foto";
    return count === 1 ? "1 foto" : `${count} fotos`;
  }

  const filled = countFilledCategories(section.categories, photosByCategory);
  return `${filled}/${section.categories.length}`;
}

interface PhotoSlotCardProps {
  categoryPhotos: InspectionPhoto[];
  label: string;
  hint: string;
  icon: LucideIcon;
  onClick: () => void;
}

function PhotoSlotCard({
  categoryPhotos,
  label,
  hint,
  icon,
  onClick,
}: PhotoSlotCardProps) {
  const photo = categoryPhotos[categoryPhotos.length - 1];
  const isPending = photo ? isPendingPhoto(photo) : false;

  return (
    <PhotoSlotFrame
      label={label}
      hint={hint}
      icon={icon}
      imageUrl={photo?.public_url}
      countBadge={categoryPhotos.filter((item) => !isPendingPhoto(item)).length || undefined}
      isUploading={isPending}
      onClick={onClick}
    />
  );
}

export function PhotoSlotGrid({ photos, onUpload }: PhotoSlotGridProps) {
  const photosByCategory = photos.reduce<Record<string, InspectionPhoto[]>>((acc, photo) => {
    (acc[photo.category] ??= []).push(photo);
    return acc;
  }, {});

  const requiredCategories = PHOTO_CATEGORIES.filter(
    (category) => !MULTI_PHOTO_CATEGORIES.has(category),
  );
  const filledRequired = countFilledCategories(requiredCategories, photosByCategory);
  const totalRequired = requiredCategories.length;
  const progress = Math.round((filledRequired / totalRequired) * 100);
  const confirmedPhotoCount = photos.filter((photo) => !isPendingPhoto(photo)).length;

  const handleSlotClick = (category: string) => {
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
    <div className="w-full space-y-5 sm:space-y-6 lg:space-y-5">
      <div className="rounded-xl border border-border bg-card p-4 shadow-soft sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">Progresso geral</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {filledRequired} de {totalRequired} moldes obrigatórios preenchidos. Documentos e fotos extras são opcionais.
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">{progress}%</p>
            <p className="text-xs text-muted-foreground">
              {confirmedPhotoCount} foto{confirmedPhotoCount === 1 ? "" : "s"} no total
            </p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full gradient-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {PHOTO_SECTION_LIST.map((section) => (
        <FormSectionCard
          key={section.id}
          id={section.id}
          index={section.index}
          title={section.title}
          description={section.description}
          statusLabel={buildSectionStatus(section, photosByCategory)}
          optional={section.optional ?? false}
          collapsible={section.collapsible ?? false}
          defaultOpen={section.defaultOpen ?? true}
        >
          <div
            className={cn(
              section.categories.every((category) => MULTI_PHOTO_CATEGORIES.has(category))
                ? "min-w-0"
                : "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4",
            )}
          >
            {section.categories.map((category) => {
              const categoryPhotos = photosByCategory[category] ?? [];
              const Icon = CATEGORY_ICONS[category] ?? Camera;
              const label = PHOTO_CATEGORY_LABELS[category] ?? category;
              const hint = CATEGORY_HINTS[category] ?? "";

              if (MULTI_PHOTO_CATEGORIES.has(category)) {
                return (
                  <MultiPhotoGallery
                    key={category}
                    label={label}
                    hint={hint}
                    icon={Icon}
                    photos={categoryPhotos}
                    onAdd={() => handleSlotClick(category)}
                  />
                );
              }

              return (
                <PhotoSlotCard
                  key={category}
                  categoryPhotos={categoryPhotos}
                  label={label}
                  hint={hint}
                  icon={Icon}
                  onClick={() => handleSlotClick(category)}
                />
              );
            })}
          </div>
        </FormSectionCard>
      ))}
    </div>
  );
}
