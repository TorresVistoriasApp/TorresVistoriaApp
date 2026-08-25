import { describe, expect, it, beforeEach, vi } from "vitest";
import { eventBus, EventNames } from "@/core/events";
import { resetIntegrations, registerIntegration } from "@/core/integrations/registry";
import { VehicleQueryType } from "@/core/integrations/ports/vehicle-lookup";
import type { CreditLedgerPort } from "@/core/integrations/ports/credit-ledger";
import type { VehicleLookupPort } from "@/core/integrations/ports/vehicle-lookup";
import {
  createInMemoryConsultaRepository,
  setConsultaRepository,
} from "@/modules/torres-consulta/repositories/consulta-repository";
import { requestConsulta } from "@/modules/torres-consulta/application/use-cases/request-consulta";
import { ConsultaStatus } from "@/modules/torres-consulta/domain/entities/consulta";

const context = {
  tenantId: "00000000-0000-4000-8000-000000000001",
  userId: "00000000-0000-4000-8000-0000000000aa",
};

const creditsStub: CreditLedgerPort = {
  getBalance: async () => ({
    ok: true,
    data: { available: 100, pending: 0, nextExpirationAt: null },
  }),
  reserve: async () => ({
    ok: true,
    data: { reservationId: "res-1" },
  }),
  release: async () => ({ ok: true, data: undefined }),
  settle: async () => ({ ok: true, data: undefined }),
  listEntries: async () => ({ ok: true, data: [] }),
  listPackages: async () => ({ ok: true, data: [] }),
};

const vehicleStub: VehicleLookupPort = {
  getQueryCost: () => 1,
  query: async () => ({
    ok: true,
    data: {
      id: "q-1",
      type: VehicleQueryType.BASIC,
      vehicle: {
        plate: "ABC1D23",
        brand: "Fiat",
        model: "Uno",
        modelYear: 2020,
        manufactureYear: 2019,
        color: "Branco",
        chassis: null,
        fuel: null,
        city: null,
        state: null,
      },
      findings: [],
      documentUrl: null,
      queriedAt: new Date().toISOString(),
      provider: "stub",
    },
  }),
  getById: async () => ({
    ok: false,
    code: "not_found",
    message: "not found",
  }),
};

describe("requestConsulta", () => {
  beforeEach(() => {
    eventBus.reset();
    resetIntegrations();
    setConsultaRepository(createInMemoryConsultaRepository());
    registerIntegration("credits", creditsStub);
    registerIntegration("vehicleLookup", vehicleStub);
  });

  it("persiste consulta concluída e publica eventos", async () => {
    const completed = vi.fn();
    eventBus.subscribe(EventNames.CONSULTA_COMPLETED, completed);

    const result = await requestConsulta(context, {
      type: VehicleQueryType.BASIC,
      plate: "ABC1D23",
      chassis: null,
    });

    expect(result.status).toBe(ConsultaStatus.COMPLETED);
    expect(result.creditsCharged).toBeGreaterThan(0);
    expect(completed).toHaveBeenCalledOnce();
  });

  it("falha quando integração falta", async () => {
    resetIntegrations();
    await expect(
      requestConsulta(context, {
        type: VehicleQueryType.BASIC,
        plate: "ABC1D23",
        chassis: null,
      }),
    ).rejects.toThrow(/indisponível/i);
  });
});
