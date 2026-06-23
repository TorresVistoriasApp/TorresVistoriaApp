import { z } from "zod";
import { UserRole } from "@/lib/enums";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const inviteUserSchema = z.object({
  email: z.string().email("E-mail inválido"),
  fullName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  role: z.enum([UserRole.SUPER_ADMIN, UserRole.VISTORIADOR]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
