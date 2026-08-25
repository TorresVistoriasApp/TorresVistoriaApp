import { describe, expect, it } from "vitest";
import {
  buildCaptureSequence,
  findNextRecommendedCategory,
  findNewlyCompletedCategories,
} from "@/modules/torres-vistoria/domain/photos/photo-capture-sequence";
import { createPhotoCaptureContext } from "@/modules/torres-vistoria/domain/photos/photo-capture-visibility";

describe("buildCaptureSequence", () => {
  it("segue a ordem das 13 etapas do fluxo", () => {
    const context = createPhotoCaptureContext();
    const sequence = buildCaptureSequence(context);

    expect(sequence[0]?.category.key).toBe("DOC_VEICULO");
    expect(sequence[1]?.category.key).toBe("EXT_FRENTE_45_DIR");
    expect(sequence.at(-1)?.sectionKey).toBe("AVARIAS");
  });

  it("inclui subseções de quadros das portas na sequência", () => {
    const context = createPhotoCaptureContext();
    const sequence = buildCaptureSequence(context);
    const quadrosItems = sequence.filter((item) => item.sectionKey === "QUADROS_PORTAS");

    expect(quadrosItems.map((item) => item.category.key)).toEqual([
      "QDP_PORTA_DIANT_ESQ",
      "QDP_PORTA_TRASEIRA_ESQ",
      "QDP_PORTA_DIANT_DIR",
      "QDP_PORTA_TRASEIRA_DIR",
      "QDP_TESTE_PINTURA_1",
      "QDP_TESTE_PINTURA_2",
      "QDP_TESTE_PINTURA_3",
      "QDP_TESTE_PINTURA_4",
    ]);
  });
});

describe("findNextRecommendedCategory", () => {
  it("retorna a primeira fotografia SINGLE pendente", () => {
    const context = createPhotoCaptureContext();
    expect(findNextRecommendedCategory([], context)).toBe("DOC_VEICULO");

    expect(
      findNextRecommendedCategory(
        [{ id: "1", category: "DOC_VEICULO" }],
        context,
      ),
    ).toBe("EXT_FRENTE_45_DIR");
  });
});

describe("findNewlyCompletedCategories", () => {
  it("detecta categoria recém-concluída", () => {
    const context = createPhotoCaptureContext();
    const previous = [{ id: "1", category: "DOC_VEICULO" }];
    const current = [
      { id: "1", category: "DOC_VEICULO" },
      { id: "2", category: "EXT_FRENTE_45_DIR" },
    ];

    expect(findNewlyCompletedCategories(previous, current, context)).toEqual([
      "EXT_FRENTE_45_DIR",
    ]);
  });
});
