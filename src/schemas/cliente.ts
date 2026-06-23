import { z } from "zod";

const cpfCnpjRegex = /^(\d{11}|\d{14})$/;

export const clienteSchema = z.object({
  client_name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(200),
  client_document: z
    .string()
    .min(11, "CPF/CNPJ inválido")
    .max(18)
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => cpfCnpjRegex.test(v), "CPF/CNPJ inválido"),
  client_phone: z
    .string()
    .min(10, "Telefone inválido")
    .max(15)
    .optional()
    .nullable()
    .or(z.literal("")),
  client_email: z
    .string()
    .email("E-mail inválido")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type ClienteInput = z.infer<typeof clienteSchema>;
