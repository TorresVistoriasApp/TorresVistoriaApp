import { z } from "zod";

export const inspectionTypeSchema = z.object({
  name: z.string().min(2, "Nome obrigatório").max(120),
  amount: z.coerce.number().min(0, "Valor inválido").max(999_999),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export const inspectionTypeUpdateSchema = inspectionTypeSchema.partial();

export type InspectionTypeInput = z.infer<typeof inspectionTypeSchema>;
export type InspectionTypeUpdateInput = z.infer<typeof inspectionTypeUpdateSchema>;
