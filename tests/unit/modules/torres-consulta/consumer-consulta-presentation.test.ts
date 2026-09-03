import { describe, expect, it } from "vitest";
import { ConsultaStatus } from "@/modules/torres-consulta/domain/entities/consulta";
import type { ConsumerConsulta } from "@/modules/torres-consulta/domain/entities/consumer-consulta";
import { VehicleQueryType } from "@/core/integrations/ports/vehicle-lookup";
import { getConsumerConsultaIdentifier } from "@/modules/torres-consulta/utils/consumer-consulta-presentation";

function consulta(partial: Partial<ConsumerConsulta>): ConsumerConsulta {
  return {
    id: "1",
    consumerId: "c",
    planName: "Básico",
    queryType: VehicleQueryType.BASIC,
    plate: null,
    chassis: "9BWZZZ377VT004251",
    status: ConsultaStatus.COMPLETED,
    creditsCharged: 0,
    failureReason: null,
    documentUrl: null,
    resultPayload: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    completedAt: null,
    ...partial,
  };
}

describe("getConsumerConsultaIdentifier", () => {
  it("mascara chassi em listagem e revela no detalhe autorizado", () => {
    const row = consulta({});
    expect(getConsumerConsultaIdentifier(row)).toBe("9BWZ•••••••••4251");
    expect(getConsumerConsultaIdentifier(row, { revealChassis: true })).toBe("9BWZZZ377VT004251");
  });

  it("mostra a placa sem máscara", () => {
    expect(getConsumerConsultaIdentifier(consulta({ plate: "ABC1D23", chassis: null }))).toBe(
      "ABC1D23",
    );
  });
});
