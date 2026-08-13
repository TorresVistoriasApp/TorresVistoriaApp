import { describe, expect, it, vi, beforeEach } from "vitest";
import { VehicleQueryType } from "@/core/integrations/ports/vehicle-lookup";
import { ConsultaStatus } from "@/modules/torres-consulta/domain/entities/consulta";
import type { ConsumerConsultaRepository } from "@/modules/torres-consulta/domain/repositories/consumer-consulta-repository";

const mocks = vi.hoisted(() => ({
  isConsultaAvailable: vi.fn(),
  save: vi.fn(),
  getCreditBalance: vi.fn(),
  list: vi.fn(),
}));

vi.mock("@/modules/torres-consulta/domain/services/consulta-availability", () => ({
  isConsultaAvailable: mocks.isConsultaAvailable,
}));

vi.mock("@/modules/torres-consulta/repositories/consumer-consulta-repository", () => ({
  getConsumerConsultaRepository: () =>
    ({
      save: mocks.save,
      getCreditBalance: mocks.getCreditBalance,
      list: mocks.list,
      findById: vi.fn(),
    }) satisfies ConsumerConsultaRepository,
}));

import { requestConsumerConsulta } from "@/modules/torres-consulta/application/use-cases/consumer-consulta";

const savedConsulta = {
  id: "consulta-1",
  consumerId: "consumer-1",
  planName: "Básico",
  queryType: VehicleQueryType.BASIC,
  plate: "ABC1D23",
  chassis: null,
  status: ConsultaStatus.PROCESSING,
  creditsCharged: 0,
  failureReason: null,
  documentUrl: null,
  resultPayload: null,
  createdAt: "2026-08-11T12:00:00.000Z",
  completedAt: null,
};

describe("requestConsumerConsulta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.save.mockResolvedValue(savedConsulta);
    mocks.getCreditBalance.mockResolvedValue({ available: 5, pending: 0 });
  });

  it("registra consulta em PROCESSING quando integração indisponível sem exigir créditos", async () => {
    mocks.isConsultaAvailable.mockReturnValue(false);

    const result = await requestConsumerConsulta("consumer-1", {
      planName: "Básico",
      queryType: VehicleQueryType.BASIC,
      plate: "ABC1D23",
      chassis: null,
    });

    expect(mocks.getCreditBalance).not.toHaveBeenCalled();
    expect(mocks.save).toHaveBeenCalledOnce();
    expect(result.status).toBe(ConsultaStatus.PROCESSING);
    expect(result.failureReason).toContain("integração");
  });

  it("exige créditos quando integração disponível", async () => {
    mocks.isConsultaAvailable.mockReturnValue(true);
    mocks.getCreditBalance.mockResolvedValue({ available: 0, pending: 0 });

    await expect(
      requestConsumerConsulta("consumer-1", {
        planName: "Completo",
        queryType: VehicleQueryType.COMPLETE,
        plate: "ABC1D23",
        chassis: null,
      }),
    ).rejects.toMatchObject({ code: "INSUFFICIENT_CREDITS" });

    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("persiste consulta quando há créditos e integração ativa", async () => {
    mocks.isConsultaAvailable.mockReturnValue(true);
    mocks.getCreditBalance.mockResolvedValue({ available: 10, pending: 0 });

    const result = await requestConsumerConsulta("consumer-1", {
      planName: "Básico",
      queryType: VehicleQueryType.BASIC,
      plate: "ABC1D23",
      chassis: null,
    });

    expect(mocks.save).toHaveBeenCalledOnce();
    expect(result.id).toBe("consulta-1");
    expect(result.failureReason).toBeNull();
  });
});
