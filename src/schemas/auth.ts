import { z } from "zod";
import { UserRole } from "@/lib/enums";
import { isStrongPassword, STRONG_PASSWORD_MESSAGE } from "@/lib/password-policy";

export const strongPasswordSchema = z
  .string()
  .min(1, "Informe a senha")
  .refine(isStrongPassword, STRONG_PASSWORD_MESSAGE);

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  acceptTerms: z.boolean().refine((value) => value, {
    message: "Você deve aceitar a Política de Privacidade e LGPD",
  }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

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

export const changePasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });


export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type InviteUserInput = CreateUserInput;
