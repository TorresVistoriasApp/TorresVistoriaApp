import { photoMatchesCategory } from "@/lib/photos/legacy-category-map";

export const AVARIA_CATEGORY_KEY = "AVARIA" as const;

export const DAMAGE_SEVERITY_VALUES = ["LEVE", "MODERADA", "GRAVE"] as const;

export type DamageSeverity = (typeof DAMAGE_SEVERITY_VALUES)[number];

export const DAMAGE_SEVERITY_OPTIONS: {
  value: DamageSeverity;
  label: string;
  description: string;
}[] = [
  {
    value: "LEVE",
    label: "Leve",
    description: "Avaria superficial, sem comprometer estrutura ou função.",
  },
  {
    value: "MODERADA",
    label: "Moderada",
    description: "Avaria visível com impacto estético ou funcional parcial.",
  },
  {
    value: "GRAVE",
    label: "Grave",
    description: "Avaria severa, com risco estrutural ou de segurança.",
  },
];

export const DAMAGE_SEVERITY_LABELS: Record<DamageSeverity, string> = {
  LEVE: "Leve",
  MODERADA: "Moderada",
  GRAVE: "Grave",
};

export const DAMAGE_LOCATION_OPTIONS = [
  "Para-choque dianteiro",
  "Para-choque traseiro",
  "Capô",
  "Tampa do porta-malas",
  "Porta dianteira esquerda",
  "Porta traseira esquerda",
  "Porta dianteira direita",
  "Porta traseira direita",
  "Lateral esquerda",
  "Lateral direita",
  "Teto",
  "Vidro",
  "Farol / lanterna",
  "Roda / pneu",
  "Interior",
  "Outro",
] as const;

export const DAMAGE_TYPE_OPTIONS = [
  "Amassado",
  "Riscado / arranhão",
  "Trinca",
  "Quebrado",
  "Ferrugem / corrosão",
  "Repintura",
  "Desalinhamento",
  "Outro",
] as const;

export type DamageCaptureForm = {
  location: string;
  customLocation: string;
  category: string;
  customCategory: string;
  severity: DamageSeverity;
  description: string;
};

export const EMPTY_DAMAGE_CAPTURE_FORM: DamageCaptureForm = {
  location: "",
  customLocation: "",
  category: "",
  customCategory: "",
  severity: "LEVE",
  description: "",
};

export type DamageCaptureFormErrors = Partial<
  Record<"location" | "category" | "severity" | "description", string>
>;

export function isDamageCategory(categoryKey: string): boolean {
  return photoMatchesCategory(categoryKey, AVARIA_CATEGORY_KEY);
}

export function resolveDamageLocation(form: DamageCaptureForm): string {
  if (form.location === "Outro") {
    return form.customLocation.trim();
  }
  return form.location.trim();
}

export function resolveDamageCategory(form: DamageCaptureForm): string {
  if (form.category === "Outro") {
    return form.customCategory.trim();
  }
  return form.category.trim();
}

export function validateDamageCaptureForm(
  form: DamageCaptureForm,
): DamageCaptureFormErrors {
  const errors: DamageCaptureFormErrors = {};
  const location = resolveDamageLocation(form);
  const category = resolveDamageCategory(form);

  if (!form.location) {
    errors.location = "Selecione a localização da avaria.";
  } else if (form.location === "Outro" && location.length < 2) {
    errors.location = "Descreva a localização (mínimo 2 caracteres).";
  }

  if (!form.category) {
    errors.category = "Selecione o tipo de avaria.";
  } else if (form.category === "Outro" && category.length < 2) {
    errors.category = "Descreva o tipo de avaria (mínimo 2 caracteres).";
  }

  if (!form.severity) {
    errors.severity = "Selecione o grau da avaria.";
  }

  if (form.description.trim().length > 500) {
    errors.description = "A descrição deve ter no máximo 500 caracteres.";
  }

  return errors;
}

export function isDamageCaptureFormValid(form: DamageCaptureForm): boolean {
  return Object.keys(validateDamageCaptureForm(form)).length === 0;
}

export function buildDamageDisplayName(
  form: DamageCaptureForm,
  index?: number,
): string {
  const category = resolveDamageCategory(form);
  const location = resolveDamageLocation(form);
  const prefix = typeof index === "number" ? `Avaria ${index}` : "Avaria";

  return `${prefix} · ${category} — ${location}`;
}

export function buildDamageCaptureMetadata(
  form: DamageCaptureForm,
  index?: number,
) {
  return {
    sectionKey: "AVARIAS",
    displayName: buildDamageDisplayName(form, index),
    damageLocation: resolveDamageLocation(form),
    damageCategory: resolveDamageCategory(form),
    damageSeverity: form.severity,
    complementaryName: form.description.trim() || null,
  };
}

export function formatDamagePhotoSummary(photo: {
  display_name?: string | null;
  damage_location?: string | null;
  damage_category?: string | null;
  damage_severity?: string | null;
  complementary_name?: string | null;
}): string {
  if (photo.display_name) return photo.display_name;

  const parts = [
    photo.damage_category,
    photo.damage_location,
    photo.damage_severity
      ? DAMAGE_SEVERITY_LABELS[photo.damage_severity as DamageSeverity] ??
        photo.damage_severity
      : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "Avaria";
}

export function formatDamagePhotoCaption(photo: {
  damage_location?: string | null;
  damage_category?: string | null;
  damage_severity?: string | null;
  complementary_name?: string | null;
}): string | null {
  const severityLabel = photo.damage_severity
    ? DAMAGE_SEVERITY_LABELS[photo.damage_severity as DamageSeverity] ??
      photo.damage_severity
    : null;

  const headline = [photo.damage_category, photo.damage_location, severityLabel]
    .filter(Boolean)
    .join(" · ");

  if (!headline && !photo.complementary_name) return null;
  if (!photo.complementary_name) return headline;
  if (!headline) return photo.complementary_name;
  return `${headline} — ${photo.complementary_name}`;
}
