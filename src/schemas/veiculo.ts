export { veiculoSchema } from "@/schemas/vistoria";
import { z } from "zod";

export const veiculoOnlySchema = z.object({
  plate: z.string().min(7),
  chassis: z.string().min(17).max(17),
  renavam: z.string().optional().nullable(),
  brand: z.string().min(1),
  model: z.string().min(1),
  version: z.string().optional().nullable(),
  color: z.string().min(1),
  fuel: z.string().min(1),
  manufacture_year: z.coerce.number().int(),
  model_year: z.coerce.number().int(),
  mileage: z.coerce.number().int().optional().nullable(),
});

export type VeiculoInput = z.infer<typeof veiculoOnlySchema>;
