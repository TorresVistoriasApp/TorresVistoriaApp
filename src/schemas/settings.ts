import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(2, "Nome obrigatório").max(200),
  document: z.string().max(18).optional().nullable().or(z.literal("")),
  phone: z.string().max(15).optional().nullable().or(z.literal("")),
  email: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
});

export const settingsSchema = z.object({
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida"),
  theme_mode: z.enum(["light", "dark", "system"]),
  legal_footer: z.string().max(2000).optional().nullable().or(z.literal("")),
  signature_image_url: z.string().url().optional().nullable().or(z.literal("")),
  watermark_enabled: z.boolean(),
});

export type CompanyInput = z.infer<typeof companySchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
