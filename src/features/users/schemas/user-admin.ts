import { z } from "zod";
import { UserRole } from "@/lib/enums";
import { isStrongPassword, STRONG_PASSWORD_MESSAGE } from "@/lib/password-policy";

const strongPasswordSchema = z
  .string()
  .min(1, "Informe a senha")
  .refine(isStrongPassword, STRONG_PASSWORD_MESSAGE);

export const createUserSchema = z.object({
  email: z.string().email("E-mail inválido"),
  fullName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  role: z.enum([UserRole.SUPER_ADMIN, UserRole.VISTORIADOR]),
  password: strongPasswordSchema,
});

export const updateUserSchema = z.object({
  email: z.string().email("E-mail inválido"),
  fullName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  role: z.enum([UserRole.SUPER_ADMIN, UserRole.VISTORIADOR]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
