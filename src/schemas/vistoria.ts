import { z } from "zod";
import {
  ChecklistStatus,
  FinancialEntryType,
  InspectionOpinion,
  InspectionSituation,
  InspectionStatus,
} from "@/lib/enums";

const cpfCnpjRegex = /^(\d{11}|\d{14})$/;

const situationEnum = z.enum([
  InspectionSituation.PARTICULAR,
  InspectionSituation.LOJA,
  InspectionSituation.LEILAO,
  InspectionSituation.RECUPERADO,
  InspectionSituation.SINISTRADO,
  InspectionSituation.ALIENADO,
]);
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
const checklistStatusEnum = z.enum([
  ChecklistStatus.CONFORME,
  ChecklistStatus.NAO_CONFORME,
  ChecklistStatus.NA,
]);
const financialTypeEnum = z.enum([
  FinancialEntryType.RECEITA,
  FinancialEntryType.DESPESA,
  FinancialEntryType.CUSTO,
]);

export const clienteSchema = z.object({
  client_name: z.string().min(2, "Nome obrigatório"),
  client_document: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => cpfCnpjRegex.test(v), "CPF/CNPJ inválido"),
  client_phone: z.string().optional().nullable(),
  client_email: z.string().email("E-mail inválido").optional().or(z.literal("")).nullable(),
});

export const veiculoSchema = z.object({
  plate: z.string().min(7, "Placa obrigatória").max(8),
  chassis: z.string().min(17, "Chassi deve ter 17 caracteres").max(17),
  renavam: z.string().optional().nullable(),
  brand: z.string().min(1, "Marca obrigatória"),
  model: z.string().min(1, "Modelo obrigatório"),
  version: z.string().optional().nullable(),
  color: z.string().min(1, "Cor obrigatória"),
  fuel: z.string().min(1, "Combustível obrigatório"),
  manufacture_year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  model_year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 2),
  mileage: z.coerce.number().int().min(0).optional().nullable(),
});

export const vistoriaSchema = z
  .object({
    inspection_date: z.string().min(1, "Data obrigatória"),
    inspection_time: z.string().min(1, "Hora obrigatória"),
    location: z.string().min(2, "Local obrigatório"),
    situation: situationEnum,
    opinion: opinionEnum.optional().nullable(),
    technical_notes: z.string().optional().nullable(),
    internal_notes: z.string().optional().nullable(),
    status: statusEnum.default(InspectionStatus.DRAFT),
  })
  .merge(clienteSchema)
  .merge(veiculoSchema);

export type VistoriaInput = z.infer<typeof vistoriaSchema>;

export const checklistItemSchema = z.object({
  category: z.string().min(1),
  item_name: z.string().min(1),
  status: checklistStatusEnum.default(ChecklistStatus.NA),
  notes: z.string().optional().nullable(),
});

export type ChecklistItemInput = z.infer<typeof checklistItemSchema>;

export const photoUploadSchema = z.object({
  category: z.string().min(1),
  inspection_id: z.string().uuid(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export type PhotoUploadInput = z.infer<typeof photoUploadSchema>;

export const financialEntrySchema = z.object({
  entry_type: financialTypeEnum,
  description: z.string().min(2, "Descrição obrigatória"),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  entry_date: z.string().min(1),
  inspection_id: z.string().uuid().optional().nullable(),
});

export type FinancialEntryInput = z.infer<typeof financialEntrySchema>;

export const userSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["SUPER_ADMIN", "VISTORIADOR"]),
});

export type UserInput = z.infer<typeof userSchema>;

export const companySchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  document: z.string().optional().nullable(),
  email: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
});

export type CompanyInput = z.infer<typeof companySchema>;

export const settingsSchema = z.object({
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida"),
  theme_mode: z.enum(["light", "dark", "system"]),
  legal_footer: z.string().optional().nullable(),
  signature_image_url: z.string().url().optional().nullable().or(z.literal("")),
  watermark_enabled: z.boolean(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
