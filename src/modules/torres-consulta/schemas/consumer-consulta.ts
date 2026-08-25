import { z } from "zod";
import {
  CONSUMER_PLAN_NAMES,
  type ConsumerPlanName,
} from "@/modules/torres-consulta/domain/consumer-plan-catalog";
import {
  isValidChassis,
  isValidPlate,
  normalizeChassis,
  normalizePlate,
} from "@/modules/torres-consulta/domain/value-objects";
import { getConsumerPlanQueryType } from "@/modules/torres-consulta/domain/consumer-plan-catalog";
import type { VehicleQueryType } from "@/core/integrations/ports/vehicle-lookup";

const consumerPlanSchema = z.enum(
  CONSUMER_PLAN_NAMES as [ConsumerPlanName, ConsumerPlanName, ConsumerPlanName],
);

export const consumerConsultaFormSchema = z
  .object({
    searchBy: z.enum(["plate", "chassis"]),
    plate: z.string().trim().optional(),
    chassis: z.string().trim().optional(),
    planName: consumerPlanSchema,
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

export type ConsumerConsultaFormInput = z.infer<typeof consumerConsultaFormSchema>;

export interface ConsumerConsultaRequestInput {
  planName: ConsumerPlanName;
  queryType: VehicleQueryType;
  plate: string | null;
  chassis: string | null;
}

export function toConsumerConsultaRequest(input: ConsumerConsultaFormInput): ConsumerConsultaRequestInput {
  return {
    planName: input.planName,
    queryType: getConsumerPlanQueryType(input.planName),
    plate: input.searchBy === "plate" && input.plate ? normalizePlate(input.plate) : null,
    chassis: input.searchBy === "chassis" && input.chassis ? normalizeChassis(input.chassis) : null,
  };
}
