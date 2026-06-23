import { z } from "zod";
import { UserRole } from "@/lib/enums";

export const userProfileSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(200),
  phone: z.string().max(15).optional().nullable().or(z.literal("")),
  avatar_url: z.string().url().optional().nullable().or(z.literal("")),
});

export const userSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  notifications: z.boolean(),
  language: z.enum(["pt-BR"]),
});

export const userSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  role: z.enum([UserRole.SUPER_ADMIN, UserRole.VISTORIADOR]),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
export type UserInput = z.infer<typeof userSchema>;
