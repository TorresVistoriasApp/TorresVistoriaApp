import { describe, expect, it } from "vitest";
import {
  buildPaintTestDisplayName,
  computeQuadrosPortasProgress,
  computeSubsectionPhotoProgress,
  isQuadrosPortasTestCategory,
  QDP_PORTA_CATEGORY_KEYS,
  QDP_TESTE_PINTURA_CATEGORY_KEYS,
} from "@/lib/photos/quadros-portas";

describe("quadros-portas", () => {
  it("identifica categorias de teste de pintura", () => {
    expect(isQuadrosPortasTestCategory("QDP_TESTE_PINTURA_2")).toBe(true);
    expect(isQuadrosPortasTestCategory("QDP_PORTA_DIANT_ESQ")).toBe(false);
  });

  it("calcula progresso das subseções de quadros e testes", () => {
    const photos = [
      { id: "1", category: "QDP_PORTA_DIANT_ESQ" },
      { id: "2", category: "QDP_PORTA_TRASEIRA_ESQ" },
      { id: "3", category: "QDP_TESTE_PINTURA_1" },
    ];

    const progress = computeQuadrosPortasProgress(photos);

    expect(progress.portas).toEqual({
      completed: 2,
      total: 4,
      remaining: 2,
      isComplete: false,
    });
    expect(progress.testePintura).toEqual({
      completed: 1,
      total: 4,
      remaining: 3,
      isComplete: false,
    });
  });

  it("marca subseção como concluída quando todos os slots estão preenchidos", () => {
    const photos = QDP_TESTE_PINTURA_CATEGORY_KEYS.map((category, index) => ({
      id: String(index + 1),
      category,
    }));

    const progress = computeSubsectionPhotoProgress(photos, QDP_TESTE_PINTURA_CATEGORY_KEYS);
    expect(progress.isComplete).toBe(true);
    expect(progress.completed).toBe(4);
  });

  it("gera legenda com ferramenta utilizada", () => {
    expect(buildPaintTestDisplayName("QDP_TESTE_PINTURA_3", "MEDIDOR_ESPESSURA")).toBe(
      "Teste de pintura 3 · Medidor de espessura",
    );
  });

  it("conta 4 portas obrigatórias na subseção de quadros", () => {
    expect(QDP_PORTA_CATEGORY_KEYS).toHaveLength(4);
    expect(QDP_TESTE_PINTURA_CATEGORY_KEYS).toHaveLength(4);
  });
});
