import { z } from "zod";
import { FIELD_NA_VALUE } from "@/lib/field-na";

const cpfCnpjRegex = /^(\d{11}|\d{14})$/;

const phoneSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .refine((v) => v.length >= 10 && v.length <= 11, "Telefone inválido");

const emailSchema = z.string().email("E-mail inválido");

export const clienteSchema = z.object({
  client_name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(200),
  client_document: z
    .string()
    .min(11, "CPF/CNPJ inválido")
    .max(18)
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => cpfCnpjRegex.test(v), "CPF/CNPJ inválido"),
  client_phone: z
    .union([z.literal(FIELD_NA_VALUE), phoneSchema, z.literal("")])
    .optional()
    .nullable(),
  client_email: z
    .union([z.literal(FIELD_NA_VALUE), emailSchema, z.literal("")])
    .optional()
    .nullable(),
});

export type ClienteInput = z.infer<typeof clienteSchema>;
