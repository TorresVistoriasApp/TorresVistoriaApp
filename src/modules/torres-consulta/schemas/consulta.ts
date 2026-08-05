import { z } from "zod";
import { VehicleQueryType } from "@/core/integrations/ports/vehicle-lookup";
import {
  isValidChassis,
  isValidPlate,
  normalizeChassis,
  normalizePlate,
} from "@/modules/torres-consulta/utils/vehicle-identifier";

const queryTypeSchema = z.enum([
  VehicleQueryType.BASIC,
  VehicleQueryType.THEFT,
  VehicleQueryType.AUCTION,
  VehicleQueryType.DEBTS,
  VehicleQueryType.CLAIMS,
  VehicleQueryType.LIEN,
  VehicleQueryType.COMPLETE,
]);

/**
 * Formulário de nova consulta.
 *
 * Placa e chassi são mutuamente exclusivos: enviar os dois tornaria ambíguo
 * qual identificador o provedor deve usar como chave, então `searchBy` decide
 * qual campo é validado.
 */
export const consultaFormSchema = z
  .object({
    searchBy: z.enum(["plate", "chassis"]),
    plate: z.string().trim().optional(),
    chassis: z.string().trim().optional(),
    type: queryTypeSchema,
  })
  .superRefine((value, ctx) => {
    if (value.searchBy === "plate") {
      if (!value.plate || !isValidPlate(value.plate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["plate"],
          message: "Informe uma placa válida (ABC1234 ou ABC1D23).",
        });
      }
      return;
    }

    if (!value.chassis || !isValidChassis(value.chassis)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["chassis"],
        message: "Informe um chassi válido com 17 caracteres.",
      });
    }
  });

/** Estado bruto do formulário. */
export type ConsultaFormInput = z.infer<typeof consultaFormSchema>;

/** Payload normalizado entregue ao service. */
export interface ConsultaRequestInput {
  type: VehicleQueryType;
  plate: string | null;
  chassis: string | null;
}

/**
 * Converte a entrada do formulário no payload do domínio.
 *
 * A normalização vive fora do schema porque o resolver do react-hook-form
 * precisa que o tipo validado seja igual ao tipo do formulário.
 */
export function toConsultaRequest(input: ConsultaFormInput): ConsultaRequestInput {
  return {
    type: input.type,
    plate: input.searchBy === "plate" && input.plate ? normalizePlate(input.plate) : null,
    chassis: input.searchBy === "chassis" && input.chassis ? normalizeChassis(input.chassis) : null,
  };
}
