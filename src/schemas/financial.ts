import { z } from "zod";
import { FinancialEntryType } from "@/lib/enums";

const financialTypeEnum = z.enum([
  FinancialEntryType.RECEITA,
  FinancialEntryType.DESPESA,
  FinancialEntryType.CUSTO,
]);

export const financialEntrySchema = z.object({
  entry_type: financialTypeEnum,
  description: z.string().min(3, "Descrição é obrigatória").max(500),
  amount: z.coerce.number().min(0.01, "Valor deve ser maior que zero").max(999_999),
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  inspection_id: z.string().uuid().optional().nullable(),
});

export const financialEntryUpdateSchema = financialEntrySchema.partial();

export type FinancialEntryInput = z.infer<typeof financialEntrySchema>;
export type FinancialEntryUpdateInput = z.infer<typeof financialEntryUpdateSchema>;
