import type { ChecklistItem } from "@/services/checklist-service";
import type { Inspection } from "@/services/inspection-service";
import type { InspectionPhoto } from "@/services/photo-service";
import { computeCaptureProgress } from "@/lib/photos/photo-progress";
import { isPlaceholderDraftValue } from "@/features/draft/lib/draft-defaults";
import type { VistoriaInput } from "@/schemas/vistoria";

const FORM_WEIGHT = 0.25;
const PHOTOS_WEIGHT = 0.25;
const CHECKLIST_WEIGHT = 0.25;
const OPINION_WEIGHT = 0.25;

const TRACKED_FORM_FIELDS: (keyof VistoriaInput)[] = [
  "inspection_date",
  "inspection_time",
  "location",
  "inspection_type_id",
  "client_name",
  "client_document",
  "plate",
  "chassis",
  "brand",
  "model",
  "color",
  "fuel",
  "manufacture_year",
  "model_year",
  "situation",
  "opinion",
  "technical_notes",
];

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function computeFormProgress(data: Partial<VistoriaInput | Inspection>): number {
  if (TRACKED_FORM_FIELDS.length === 0) return 0;

  const filled = TRACKED_FORM_FIELDS.filter((field) => {
    const value = data[field as keyof typeof data];
    if (isPlaceholderDraftValue(field, value)) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "number") return Number.isFinite(value);
    return value != null;
  }).length;

  return filled / TRACKED_FORM_FIELDS.length;
}

function computeChecklistProgress(items: ChecklistItem[]): number {
  if (items.length === 0) return 0;
  const evaluated = items.filter((item) => item.status !== "PENDENTE" && item.status !== "NA").length;
  return evaluated / items.length;
}

function computeOpinionProgress(data: Partial<VistoriaInput | Inspection>): number {
  const hasOpinion = Boolean(data.opinion?.toString().trim());
  const hasNotes = Boolean(data.technical_notes?.toString().trim());
  if (hasOpinion && hasNotes) return 1;
  if (hasOpinion || hasNotes) return 0.5;
  return 0;
}

export function computeInspectionCompletionPercent(params: {
  inspection: Partial<VistoriaInput | Inspection>;
  photos?: InspectionPhoto[];
  checklist?: ChecklistItem[];
}): number {
  const { inspection, photos = [], checklist = [] } = params;

  const formProgress = computeFormProgress(inspection);
  const photoProgress = photos.length
    ? computeCaptureProgress(photos).percentComplete / 100
    : 0;
  const checklistProgress = computeChecklistProgress(checklist);
  const opinionProgress = computeOpinionProgress(inspection);

  const weighted =
    formProgress * FORM_WEIGHT +
    photoProgress * PHOTOS_WEIGHT +
    checklistProgress * CHECKLIST_WEIGHT +
    opinionProgress * OPINION_WEIGHT;

  return clampPercent(weighted * 100);
}
