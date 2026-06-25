import { z } from "zod";

const cpfCnpjDigitsRegex = /^(\d{11}|\d{14})$/;

const optionalText = (max: number) =>
  z.string().max(max).optional().nullable().or(z.literal(""));

const optionalCpfCnpj = z
  .string()
  .max(18)
  .optional()
  .nullable()
  .or(z.literal(""))
  .transform((value) => (value ?? "").replace(/\D/g, ""))
  .refine((digits) => !digits || cpfCnpjDigitsRegex.test(digits), {
    message: "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido",
  });

export const companyAddressSchema = z.object({
  address_cep: optionalText(9),
  address_street: optionalText(200),
  address_number: optionalText(20),
  address_complement: optionalText(200),
  address_neighborhood: optionalText(120),
  address_city: optionalText(120),
  address_state: optionalText(2),
});

export const companySchema = z
  .object({
    name: z.string().min(2, "Nome ou razão social obrigatório").max(200),
    document: optionalCpfCnpj,
  })
  .merge(companyAddressSchema);

export const settingsSchema = z.object({
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida"),
  theme_mode: z.literal("light"),
  legal_footer: z.string().max(2000).optional().nullable().or(z.literal("")),
  signature_image_url: z.string().url().optional().nullable().or(z.literal("")),
  watermark_enabled: z.boolean(),
});

export type CompanyInput = z.infer<typeof companySchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
