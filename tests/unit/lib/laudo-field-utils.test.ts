import { describe, expect, it } from "vitest";
import {
  buildSaleMarketInfoRows,
  buildVehicleInfoRows,
  hasLaudoValue,
  hasSaleMarketSectionData,
} from "@/lib/laudo/laudo-field-utils";
import type { LaudoPayload } from "@/lib/laudo/laudo-model";

function makeInspection(
  overrides: Record<string, unknown> = {},
): LaudoPayload["inspection"] {
  return {
    plate: "abc1d23",
    chassis: "9BWZZZ377VT004251",
    brand: "Chevrolet",
    model: "Onix",
    color: "Prata",
    fuel: "Flex",
    manufacture_year: 2022,
    model_year: 2023,
    client_name: "Cliente Teste",
    inspection_date: "2026-01-01",
    inspection_time: "10:00:00",
    location: "São Paulo",
    inspection_number: "2026-001",
    opinion: "APROVADO",
    ...overrides,
  } as LaudoPayload["inspection"];
}

describe("laudo-field-utils", () => {
  it("detecta ausência de dados na seção venda/mercado", () => {
    const inspection = makeInspection();
    expect(hasSaleMarketSectionData(inspection)).toBe(false);
    expect(buildSaleMarketInfoRows(inspection)).toEqual([]);
  });

  it("inclui apenas campos preenchidos na seção venda/mercado", () => {
    const inspection = makeInspection({
      buyer_name: "Maria Silva",
      judicial_process: "0001234-56.2026.8.26.0100",
      market_fipe_value: 45000,
    });

    expect(hasSaleMarketSectionData(inspection)).toBe(true);
    expect(buildSaleMarketInfoRows(inspection)).toEqual([
      ["Comprador", "Maria Silva"],
      ["Processo judicial", "0001234-56.2026.8.26.0100"],
      ["Valor FIPE", "R$ 45.000,00"],
    ]);
  });

  it("omite campos opcionais vazios do veículo no laudo", () => {
    const rows = buildVehicleInfoRows(
      makeInspection({
        mileage: null,
        renavam: null,
        version: "",
        vehicle_uf: "",
      }),
    );

    const labels = rows.map(([label]) => label);
    expect(labels).not.toContain("Quilometragem");
    expect(labels).not.toContain("Renavam");
    expect(labels).not.toContain("Versão");
    expect(labels).not.toContain("UF do veículo");
    expect(labels).toContain("Placa");
    expect(labels).toContain("Chassi");
  });

  it("ignora valores N/A como vazio", () => {
    expect(hasLaudoValue("N/A")).toBe(false);
  });
});
