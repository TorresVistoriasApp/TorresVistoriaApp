import { describe, expect, it } from "vitest";
import { createPhotoCaptureContext } from "@/modules/torres-vistoria/domain/photos/photo-capture-visibility";
import { computePhotoCaptureStats } from "@/modules/torres-vistoria/domain/photos/photo-capture-stats";

describe("computePhotoCaptureStats", () => {
  it("calcula slots concluídos na sequência principal", () => {
    const context = createPhotoCaptureContext();
    const stats = computePhotoCaptureStats(
      [
        { id: "1", category: "DOC_VEICULO" },
        { id: "2", category: "EXT_FRENTE_45_DIR" },
      ],
      context,
    );

    expect(stats.completedSlots).toBe(2);
    expect(stats.totalSlots).toBeGreaterThan(50);
    expect(stats.percentComplete).toBe(Math.round((2 / stats.totalSlots) * 100));
    expect(stats.totalPhotos).toBe(2);
  });
});
