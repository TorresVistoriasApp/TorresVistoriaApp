import { z } from "zod";

const optionalText = (max: number) =>
  z.string().max(max).optional().nullable().or(z.literal(""));

export const onboardCompanySchema = z.object({
  tradeName: z.string().min(2, "Nome fantasia obrigatório").max(200),
  legalName: optionalText(200),
  document: optionalText(18),
  companyEmail: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
  companyPhone: optionalText(20),
  subscriptionPlan: z.enum(["starter", "professional", "enterprise"]),
  adminFullName: z.string().min(2, "Informe o nome do administrador").max(200),
  adminEmail: z.string().email("E-mail inválido"),
  adminPassword: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
});

export type OnboardCompanyInput = z.infer<typeof onboardCompanySchema>;
