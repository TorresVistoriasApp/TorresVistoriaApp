import { describe, expect, it } from "vitest";
import {
  brazilFlagIcon,
  checklistCategoryIcon,
  pdfIcon,
  pdfIconBadge,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-icons";
import { resolveVehicleOrigin } from "@/modules/torres-vistoria/domain/laudo/pdf/vehicle-origin";

describe("pdf icons", () => {
  it("gera canvas outline sem emoji para a família de ícones", () => {
    const icon = pdfIcon("vehicle");
    expect(icon.canvas).toBeTruthy();
    expect(JSON.stringify(icon)).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
  });

  it("monta badge com moldura e pictograma", () => {
    const badge = pdfIconBadge("camera", { size: 28 });
    expect(Array.isArray(badge.canvas)).toBe(true);
    expect((badge.canvas as unknown[]).length).toBeGreaterThan(1);
  });

  it("desenha bandeira do Brasil em vetor", () => {
    const flag = brazilFlagIcon(12);
    expect(JSON.stringify(flag)).toContain("#009c3b");
    expect(JSON.stringify(flag)).toContain("#ffdf00");
  });

  it("mapeia categorias de checklist para ícones", () => {
    expect(checklistCategoryIcon("ESTRUTURA")).toBe("structure");
    expect(checklistCategoryIcon("PINTURA")).toBe("paint");
    expect(checklistCategoryIcon("MOTOR")).toBe("vehicle");
  });
});

describe("resolveVehicleOrigin", () => {
  it("não inventa origem quando o campo não existe", () => {
    expect(resolveVehicleOrigin({} as never)).toBeNull();
  });

  it("reconhece Brasil / nacional quando informado", () => {
    expect(resolveVehicleOrigin({ vehicle_origin: "Brasil" } as never)).toEqual({
      countryCode: "BR",
      label: "Brasil",
    });
    expect(resolveVehicleOrigin({ nationality: "Nacional" } as never)?.countryCode).toBe("BR");
  });
});
