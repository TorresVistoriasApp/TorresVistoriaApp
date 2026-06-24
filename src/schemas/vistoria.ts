import { z } from "zod";
import { clienteSchema } from "./cliente";
import { veiculoSchema } from "./veiculo";
import {
  InspectionOpinion,
  InspectionPurpose,
  InspectionStatus,
} from "@/lib/enums";
import { parseCurrency } from "@/lib/masks";

const opinionEnum = z.enum([
  InspectionOpinion.APROVADO,
  InspectionOpinion.APROVADO_COM_OBSERVACOES,
  InspectionOpinion.REPROVADO,
]);

const statusEnum = z.enum([
  InspectionStatus.DRAFT,
  InspectionStatus.COMPLETED,
  InspectionStatus.ARCHIVED,
]);

const purposeEnum = z.enum([
  InspectionPurpose.CAUTELAR,
  InspectionPurpose.VENDA,
  InspectionPurpose.DETRAN,
  InspectionPurpose.JUDICIAL,
  InspectionPurpose.SEGURADORA,
  InspectionPurpose.LEILAO,
]);

const optionalNumericField = (schema: z.ZodNumber) =>
  z.preprocess((value) => {
    if (value === "") return null;
    if (typeof value === "string" && value.includes("R$")) return parseCurrency(value);
    return value;
  }, schema.optional().nullable());

export const vistoriaSchema = z
  .object({
    inspection_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
    inspection_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Hora inválida"),
    location: z.string().min(2, "Local obrigatório").max(300),
    inspection_type_id: z.string().uuid("Selecione o tipo de vistoria"),
    inspection_purpose: purposeEnum.optional().nullable(),
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
    opinion: opinionEnum.optional().nullable(),
    technical_notes: z.string().max(5000).optional().nullable().or(z.literal("")),
    internal_notes: z.string().max(5000).optional().nullable().or(z.literal("")),
    status: statusEnum.default(InspectionStatus.DRAFT),
  })
  .merge(clienteSchema)
  .merge(veiculoSchema);

export const vistoriaUpdateSchema = vistoriaSchema.partial();

export type VistoriaInput = z.infer<typeof vistoriaSchema>;
export type VistoriaUpdateInput = z.infer<typeof vistoriaUpdateSchema>;
