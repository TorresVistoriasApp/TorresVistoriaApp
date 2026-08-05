import { z } from "zod";
import { isStrongPassword, STRONG_PASSWORD_MESSAGE } from "@/core/auth/password-policy";

export const consumerLoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
  acceptTerms: z.boolean().refine((value) => value, {
    message: "Você deve aceitar os termos e a política de privacidade",
  }),
});

export const consumerRegisterSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome completo"),
    email: z.string().email("E-mail inválido"),
    phone: z.string().min(10, "Informe um telefone válido").optional().or(z.literal("")),
    password: z.string().min(1, "Informe a senha").refine(isStrongPassword, STRONG_PASSWORD_MESSAGE),
    confirmPassword: z.string().min(1, "Confirme a senha"),
    acceptTerms: z.boolean().refine((value) => value, {
      message: "Você deve aceitar os termos e a política de privacidade",
    }),
    acceptPrivacy: z.boolean().refine((value) => value, {
      message: "Você deve aceitar a política de privacidade",
    }),
    consentDataProcessing: z.boolean().refine((value) => value, {
      message: "É necessário consentir com o tratamento de dados",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const consumerForgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const consumerResetPasswordSchema = z
  .object({
    password: z.string().min(1, "Informe a senha").refine(isStrongPassword, STRONG_PASSWORD_MESSAGE),
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const consumerProfileSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo"),
  phone: z.string().min(10, "Informe um telefone válido").optional().or(z.literal("")),
});

export type ConsumerLoginInput = z.infer<typeof consumerLoginSchema>;
export type ConsumerRegisterInput = z.infer<typeof consumerRegisterSchema>;
export type ConsumerForgotPasswordInput = z.infer<typeof consumerForgotPasswordSchema>;
export type ConsumerResetPasswordInput = z.infer<typeof consumerResetPasswordSchema>;
export type ConsumerProfileInput = z.infer<typeof consumerProfileSchema>;
