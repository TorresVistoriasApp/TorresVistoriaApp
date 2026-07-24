import { z } from "zod";
import { clienteSchema } from "./cliente";
import { veiculoSchema } from "./veiculo";
import {
  InspectionOpinion,
  InspectionStatus,
} from "@/lib/enums";
import { FIELD_NA_VALUE } from "@/lib/field-na";
import { parseCurrency } from "@/lib/masks";
import {
  isPlaceholderDraftValue,
  WIZARD_REQUIRED_DRAFT_FIELDS,
} from "@/features/draft/lib/draft-defaults";

const opinionEnum = z.enum(
  [
    InspectionOpinion.APROVADO,
    InspectionOpinion.APROVADO_COM_OBSERVACOES,
    InspectionOpinion.REPROVADO,
  ],
  { required_error: "Selecione o parecer técnico" },
);

const statusEnum = z.enum([
  InspectionStatus.DRAFT,
  InspectionStatus.COMPLETED,
  InspectionStatus.ARCHIVED,
]);

const optionalNumericField = (schema: z.ZodNumber) =>
  z.preprocess((value) => {
    if (value === "") return null;
    if (typeof value === "string" && value.includes("R$")) return parseCurrency(value);
    return value;
  }, schema.optional().nullable());

const purposeField = z.string().max(120).optional().nullable();

export const vistoriaSchema = z
  .object({
    inspection_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
    inspection_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Hora inválida"),
    location: z.string().min(2, "Local obrigatório").max(300),
    inspection_type_id: z.string().uuid("Selecione o tipo de vistoria"),
    inspection_purpose: purposeField,
    requester_name: z.string().max(200).optional().nullable().or(z.literal("")),
    requester_document: z.string().max(18).optional().nullable().or(z.literal("")),
    buyer_name: z.string().max(200).optional().nullable().or(z.literal("")),
    buyer_document: z.string().max(18).optional().nullable().or(z.literal("")),
    seller_name: z.string().max(200).optional().nullable().or(z.literal("")),
    seller_document: z.string().max(18).optional().nullable().or(z.literal("")),
    judicial_process: z.string().max(120).optional().nullable().or(z.literal("")),
    judicial_court: z.string().max(160).optional().nullable().or(z.literal("")),
    judicial_district: z.string().max(120).optional().nullable().or(z.literal("")),
    market_fipe_value: optionalNumericField(z.coerce.number().min(0)),
    market_average_value: optionalNumericField(z.coerce.number().min(0)),
    insurance_acceptance_percent: optionalNumericField(z.coerce.number().min(0).max(100)),
    vehicle_condition: z.string().max(80).optional().nullable().or(z.literal("")),
    opinion: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      opinionEnum,
    ),
    technical_notes: z
      .string()
      .trim()
      .min(10, "Descreva as observações técnicas (mínimo 10 caracteres)")
      .max(5000),
    internal_notes: z.string().max(5000).optional().nullable().or(z.literal("")),
    status: statusEnum.default(InspectionStatus.DRAFT),
  })
  .merge(clienteSchema)
  .merge(veiculoSchema);

export const vistoriaUpdateSchema = vistoriaSchema.partial();

/**
 * Validação do passo 1 do wizard: dados para seguir às fotos.
 * Parecer e observações técnicas são preenchidos ao final do checklist.
 */
export const vistoriaWizardContinueSchema = vistoriaSchema
  .omit({ opinion: true, technical_notes: true })
  .extend({
    opinion: z
      .preprocess(
        (value) => (value === "" || value === null ? undefined : value),
        opinionEnum.optional(),
      )
      .optional(),
    technical_notes: z.string().max(5000).optional().or(z.literal("")),
    inspection_type_id: z.string().uuid("Selecione o tipo de vistoria"),
  })
  .superRefine((data, ctx) => {
    for (const { field, label } of WIZARD_REQUIRED_DRAFT_FIELDS) {
      const value = data[field as keyof typeof data];
      if (isPlaceholderDraftValue(field, value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Preencha o campo ${label}`,
          path: [field],
        });
      }
    }
  });

/** Validação flexível para auto-save de rascunhos (campos parciais). */
export const vistoriaDraftSchema = vistoriaSchema
  .partial()
  .extend({
    inspection_date: z.string().optional(),
    inspection_time: z.string().optional(),
    location: z.string().max(300).optional(),
    inspection_type_id: z.union([z.string().uuid(), z.literal("")]).optional(),
    client_name: z.string().max(200).optional(),
    client_document: z.union([z.literal(FIELD_NA_VALUE), z.string().max(18)]).optional(),
    plate: z.string().max(10).optional(),
    chassis: z.string().max(17).optional(),
    brand: z.string().max(100).optional(),
    model: z.string().max(100).optional(),
    color: z.string().max(50).optional(),
    fuel: z.string().max(50).optional(),
    technical_notes: z.string().max(5000).optional(),
    opinion: z
      .preprocess(
        (value) => (value === "" || value === null ? undefined : value),
        opinionEnum.optional(),
      )
      .optional(),
    status: statusEnum.default(InspectionStatus.DRAFT),
  });

export type VistoriaInput = z.infer<typeof vistoriaSchema>;
export type VistoriaUpdateInput = z.infer<typeof vistoriaUpdateSchema>;
export type VistoriaDraftInput = z.infer<typeof vistoriaDraftSchema>;
export type VistoriaWizardContinueInput = z.infer<typeof vistoriaWizardContinueSchema>;
