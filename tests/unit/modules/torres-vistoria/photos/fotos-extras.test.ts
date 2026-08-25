import { describe, expect, it } from "vitest";
import { PHOTO_CAPTURE_SECTIONS } from "@/modules/torres-vistoria/domain/photos/photo-catalog";
import {
  FOTOS_EXTRAS_BLINDAGEM_KEYS,
  FOTOS_EXTRAS_COMPLEMENTAR_KEY,
  FOTOS_EXTRAS_ITEM_KEYS,
  FOTOS_EXTRAS_SUBSECTION_KEYS,
} from "@/modules/torres-vistoria/domain/photos/fotos-extras";

describe("fotos-extras", () => {
  const fotosExtrasSection = PHOTO_CAPTURE_SECTIONS.find(
    (section) => section.key === "FOTOS_EXTRAS",
  )!;

  it("expõe 9 itens nomeados + complementar", () => {
    expect(FOTOS_EXTRAS_ITEM_KEYS).toHaveLength(9);
    expect(FOTOS_EXTRAS_COMPLEMENTAR_KEY).toBe("COMPLEMENTAR");
  });

  it("expõe 5 categorias de blindagem", () => {
    expect(FOTOS_EXTRAS_BLINDAGEM_KEYS).toHaveLength(5);
  });

  it("alinha subseções do catálogo com as constantes do módulo", () => {
    const subsectionKeys = (fotosExtrasSection.subsections ?? []).map((s) => s.key);
    expect(subsectionKeys).toEqual([
      FOTOS_EXTRAS_SUBSECTION_KEYS.ITENS,
      FOTOS_EXTRAS_SUBSECTION_KEYS.BLINDAGEM,
    ]);

    const itensKeys = fotosExtrasSection.subsections![0].categories.map((c) => c.key);
    expect(itensKeys).toEqual([...FOTOS_EXTRAS_ITEM_KEYS, FOTOS_EXTRAS_COMPLEMENTAR_KEY]);

    const blindagemKeys = fotosExtrasSection.subsections![1].categories.map((c) => c.key);
    expect(blindagemKeys).toEqual([...FOTOS_EXTRAS_BLINDAGEM_KEYS]);
  });
});
