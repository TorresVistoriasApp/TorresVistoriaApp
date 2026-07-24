import { DRAFT_PLACEHOLDER_VALUES } from "@/features/draft/lib/draft-defaults";
import { maskCpfCnpj, maskPhone, maskPlate } from "@/lib/masks";
import { isFieldNA } from "@/lib/field-na";
import type { VistoriaInput } from "@/schemas/vistoria";
import type { Inspection } from "@/services/inspection-service";

function clearDraftPlaceholdersForForm(
  data: Partial<VistoriaInput>,
): Partial<VistoriaInput> {
  const result = { ...data };

  for (const [field, placeholder] of Object.entries(DRAFT_PLACEHOLDER_VALUES)) {
    const key = field as keyof VistoriaInput;
    if (result[key] === placeholder) {
      (result as Record<string, unknown>)[field] = "";
    }
  }

  return result;
}

/** Restaura valores sentinela no banco quando o campo ficou vazio no formulário. */
export function restoreDraftPlaceholdersForSave(
  data: Partial<VistoriaInput>,
): Partial<VistoriaInput> {
  const result = { ...data };

  for (const [field, placeholder] of Object.entries(DRAFT_PLACEHOLDER_VALUES)) {
    const key = field as keyof VistoriaInput;
    const value = result[key];
    if (typeof value === "string" && value.trim() === "") {
      (result as Record<string, unknown>)[field] = placeholder;
    }
  }

  return result;
}

/** Formata valores do banco para exibição nos inputs mascarados. */
export function formatVistoriaFormDefaults(
  data: Partial<Inspection> | Partial<VistoriaInput>,
): Partial<VistoriaInput> {
  const cleared = clearDraftPlaceholdersForForm(data as Partial<VistoriaInput>);
  const result = { ...cleared } as Partial<VistoriaInput>;

  if (result.client_document && !isFieldNA(result.client_document)) {
    result.client_document = maskCpfCnpj(result.client_document);
  }
  if (result.client_phone && !isFieldNA(result.client_phone)) {
    result.client_phone = maskPhone(result.client_phone);
  }
  if (result.plate) {
    result.plate = maskPlate(result.plate);
  }

  delete result.inspection_purpose;

  return result;
}

export function prepareVistoriaFormForSave(
  data: Partial<VistoriaInput>,
): Partial<VistoriaInput> {
  return restoreDraftPlaceholdersForSave(data);
}
