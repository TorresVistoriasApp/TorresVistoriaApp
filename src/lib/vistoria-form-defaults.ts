import { maskCpfCnpj, maskPhone, maskPlate } from "@/lib/masks";
import { isFieldNA } from "@/lib/field-na";
import type { VistoriaInput } from "@/schemas/vistoria";
import type { Inspection } from "@/services/inspection-service";

/** Formata valores do banco para exibição nos inputs mascarados. */
export function formatVistoriaFormDefaults(
  data: Partial<Inspection> | Partial<VistoriaInput>,
): Partial<VistoriaInput> {
  const result = { ...data } as Partial<VistoriaInput>;

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
