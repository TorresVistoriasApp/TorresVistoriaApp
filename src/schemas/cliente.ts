export { clienteSchema, type VistoriaInput } from "@/schemas/vistoria";
import { z } from "zod";

export const clienteOnlySchema = z.object({
  client_name: z.string().min(2),
  client_document: z.string().min(11),
  client_phone: z.string().optional().nullable(),
  client_email: z.string().email().optional().or(z.literal("")).nullable(),
});

export type ClienteInput = z.infer<typeof clienteOnlySchema>;
