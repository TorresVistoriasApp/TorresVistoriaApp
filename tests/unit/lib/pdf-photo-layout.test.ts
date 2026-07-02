import { describe, expect, it } from "vitest";
import { selectFeaturedVehiclePhotos } from "@/lib/photos/pdf-photo-layout";
import type { LaudoPhoto } from "@/lib/laudo/laudo-model";

function photo(id: string, category: string): LaudoPhoto {
  return {
    id,
    category,
    public_url: `https://example.com/${id}.jpg`,
    dataUrl: `data:image/jpeg;base64,${id}`,
  } as LaudoPhoto;
}

describe("selectFeaturedVehiclePhotos", () => {
  it("seleciona frente 45° esquerda e direita em ordem", () => {
    const photos = [
      photo("1", "TRS_PORTA_MALAS_ABERTO"),
      photo("2", "TRS_PAINEL_TRASEIRO_SUPERIOR"),
      photo("3", "EXT_FRENTE_45_DIR"),
      photo("4", "EXT_FRENTE_45_ESQ"),
    ];

    const featured = selectFeaturedVehiclePhotos(photos);

    expect(featured.map((item) => item.id)).toEqual(["4", "3"]);
  });

  it("aceita categorias legadas de frente 45°", () => {
    const photos = [
      photo("1", "FRENTE_45_ESQUERDA"),
      photo("2", "FRENTE_45_DIREITA"),
      photo("3", "TRS_PORTA_MALAS_ABERTO"),
    ];

    const featured = selectFeaturedVehiclePhotos(photos);

    expect(featured.map((item) => item.id)).toEqual(["1", "2"]);
  });

  it("ignora fotos de estrutura traseira", () => {
    const photos = [
      photo("1", "TRS_PORTA_MALAS_ABERTO"),
      photo("2", "TRS_PAINEL_TRASEIRO_SUPERIOR"),
    ];

    expect(selectFeaturedVehiclePhotos(photos)).toEqual([]);
  });
});
