import { z } from "zod";
import { isStrongPassword, STRONG_PASSWORD_MESSAGE } from "@/core/auth/password-policy";
import {
  isValidInspectorDocument,
  type InspectorDocumentType,
} from "@/core/auth/validators/document";

export const inspectorRegisterSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome completo"),
    email: z.string().email("E-mail inválido"),
    phone: z
      .string()
      .optional()
      .refine((value) => !value || value.replace(/\D/g, "").length >= 10, {
        message: "Informe um telefone válido com DDD",
      }),
    documentType: z.enum(["cpf", "cnpj"]),
    document: z.string().min(1, "Informe o CPF ou CNPJ"),
    password: z.string().min(1, "Informe a senha").refine(isStrongPassword, STRONG_PASSWORD_MESSAGE),
    confirmPassword: z.string().min(1, "Confirme a senha"),
    /** Consentimento único: Termos de Uso, Política de Privacidade e LGPD. */
    acceptTerms: z.boolean().refine((value) => value, {
      message: "É necessário aceitar os termos para criar a conta",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    if (!isValidInspectorDocument(data.document, data.documentType as InspectorDocumentType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["document"],
        message: data.documentType === "cpf" ? "CPF inválido." : "CNPJ inválido.",
      });
    }
  });

export type InspectorRegisterInput = z.infer<typeof inspectorRegisterSchema>;
