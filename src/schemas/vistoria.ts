import { z } from "zod";
import { clienteSchema } from "./cliente";
import { veiculoSchema } from "./veiculo";
import {
  InspectionOpinion,
  InspectionStatus,
} from "@/lib/enums";

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

export const vistoriaSchema = z
  .object({
    inspection_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
    inspection_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Hora inválida"),
    location: z.string().min(2, "Local obrigatório").max(300),
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
