import { describe, expect, it } from "vitest";
import {
  PHOTO_CAPTURE_SECTIONS,
  PHOTO_CATALOG,
} from "@/lib/photos/photo-catalog";
import { groupPhotosBySection } from "@/lib/photos/pdf-photo-layout";
import type { LaudoPhoto } from "@/lib/laudo/laudo-model";

describe("PHOTO_CAPTURE_SECTIONS", () => {
  it("define 13 etapas na ordem do percurso físico", () => {
    expect(PHOTO_CAPTURE_SECTIONS).toHaveLength(13);
    expect(PHOTO_CAPTURE_SECTIONS.map((section) => section.key)).toEqual([
      "DOCUMENTACAO",
      "PARTE_FRONTAL",
      "LADO_ESQUERDO",
      "PARTE_TRASEIRA",
      "PORTA_MALAS",
      "LADO_DIREITO",
      "COMPARTIMENTO_MOTOR",
      "IDENTIFICACAO",
      "INTERIOR",
      "TETO_PINTURA",
      "QUADROS_PORTAS",
      "FOTOS_EXTRAS",
      "AVARIAS",
    ]);
  });

  it("inicia com documentação aberta e demais etapas recolhidas", () => {
    expect(PHOTO_CAPTURE_SECTIONS[0]?.defaultOpen).toBe(true);
    expect(PHOTO_CAPTURE_SECTIONS.slice(1).every((section) => section.defaultOpen === false)).toBe(
      true,
    );
  });

  it("não possui chaves de categoria duplicadas", () => {
    const keys = PHOTO_CATALOG.flatMap((section) => section.categories.map((c) => c.key));
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("groupPhotosBySection", () => {
  it("agrupa fotos na nova ordem das seções", () => {
    const photos: LaudoPhoto[] = [
      {
        id: "1",
        category: "AVARIA",
        public_url: "https://example.com/1.jpg",
      } as LaudoPhoto,
      {
        id: "2",
        category: "DOC_VEICULO",
        public_url: "https://example.com/2.jpg",
      } as LaudoPhoto,
      {
        id: "3",
        category: "EXT_FRENTE_45_DIR",
        public_url: "https://example.com/3.jpg",
      } as LaudoPhoto,
    ];

    const grouped = groupPhotosBySection(photos);
    expect([...grouped.keys()]).toEqual(["DOCUMENTACAO", "PARTE_FRONTAL", "AVARIAS"]);
  });

  it("resolve categorias legadas de motor para o novo fluxo", () => {
    const photos: LaudoPhoto[] = [
      {
        id: "1",
        category: "MOT_TORRE_AMORT_ESQ",
        public_url: "https://example.com/1.jpg",
      } as LaudoPhoto,
    ];

    const grouped = groupPhotosBySection(photos);
    const motorPhotos = grouped.get("COMPARTIMENTO_MOTOR") ?? [];
    const legacyPhotos = grouped.get("LEGADO") ?? [];

    expect(motorPhotos).toHaveLength(1);
    expect(motorPhotos[0]?.category).toBe("MOT_TORRE_AMORT_ESQ");
    expect(legacyPhotos).toHaveLength(0);
  });
});
