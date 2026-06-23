import { z } from "zod";
import { InspectionSituation } from "@/lib/enums";

const plateRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}-[0-9]{4}$/;

const situationEnum = z.enum([
  InspectionSituation.PARTICULAR,
  InspectionSituation.LOJA,
  InspectionSituation.LEILAO,
  InspectionSituation.RECUPERADO,
  InspectionSituation.SINISTRADO,
  InspectionSituation.ALIENADO,
]);

export const veiculoSchema = z.object({
  plate: z
    .string()
    .transform((v) => v.replace(/[^A-Z0-9]/gi, "").toUpperCase())
    .refine((v) => plateRegex.test(v) || v.length === 7, "Placa inválida"),
  chassis: z.string().min(17, "Chassi deve ter 17 caracteres").max(17),
  renavam: z.string().min(9, "Renavam inválido").max(11).optional().nullable().or(z.literal("")),
  brand: z.string().min(2, "Marca é obrigatória").max(100),
  model: z.string().min(2, "Modelo é obrigatório").max(100),
  version: z.string().max(100).optional().nullable().or(z.literal("")),
  color: z.string().min(1, "Cor é obrigatória").max(50),
  fuel: z.string().min(1, "Combustível é obrigatório").max(50),
  manufacture_year: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  model_year: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 2),
  mileage: z.coerce.number().int().min(0).max(9_999_999).optional().nullable(),
  situation: situationEnum,
});

export type VeiculoInput = z.infer<typeof veiculoSchema>;
