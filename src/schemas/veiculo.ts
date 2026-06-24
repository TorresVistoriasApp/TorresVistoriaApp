import { z } from "zod";
import { FIELD_NA_VALUE } from "@/lib/field-na";
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

const renavamSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .refine((v) => v.length >= 9 && v.length <= 11, "Renavam inválido");

export const veiculoSchema = z.object({
  plate: z
    .string()
    .transform((v) => v.replace(/[^A-Z0-9]/gi, "").toUpperCase())
    .refine((v) => plateRegex.test(v) || v.length === 7, "Placa inválida"),
  chassis: z.string().min(17, "Chassi deve ter 17 caracteres").max(17),
  renavam: z
    .union([z.literal(FIELD_NA_VALUE), renavamSchema, z.literal("")])
    .optional()
    .nullable(),
  motor_number: z.string().max(50).optional().nullable().or(z.literal("")),
  vehicle_uf: z.string().max(2).optional().nullable().or(z.literal("")),
  registration_city_uf: z.string().max(120).optional().nullable().or(z.literal("")),
  vehicle_category: z.string().max(80).optional().nullable().or(z.literal("")),
  vehicle_species: z.string().max(80).optional().nullable().or(z.literal("")),
  passenger_capacity: z.coerce.number().int().min(0).max(99).optional().nullable(),
  power_cv: z.coerce.number().int().min(0).max(2000).optional().nullable(),
  engine_displacement: z.coerce.number().int().min(0).max(10000).optional().nullable(),
  brand: z.string().min(2, "Marca é obrigatória").max(100),
  model: z.string().min(2, "Modelo é obrigatório").max(100),
  version: z
    .union([z.literal(FIELD_NA_VALUE), z.string().max(100), z.literal("")])
    .optional()
    .nullable(),
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
