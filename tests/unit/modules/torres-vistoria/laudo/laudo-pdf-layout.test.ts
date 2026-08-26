import { describe, expect, it } from "vitest";
import {
  computeDonutSegments,
  computeGaugeSegments,
  buildRingSectorPoints,
  buildDonutChartNode,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-charts";
import {
  planPhotoRows,
  photoCellWidth,
  photoCellHeight,
  buildPhotoGrid,
} from "@/modules/torres-vistoria/domain/laudo/pdf/photo-grid";
import type { LaudoPhoto } from "@/modules/torres-vistoria/domain/laudo/laudo-model";
import { PDF_PAGE } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-tokens";

describe("planPhotoRows", () => {
  it("não gera linhas para zero fotos", () => {
    expect(planPhotoRows(0)).toEqual([]);
  });

  it("usa uma, duas ou três colunas conforme a quantidade", () => {
    expect(planPhotoRows(1)).toEqual([1]);
    expect(planPhotoRows(2)).toEqual([2]);
    expect(planPhotoRows(3)).toEqual([3]);
  });

  it("evita foto solitária no final quando há quatro ou cinco fotos", () => {
    expect(planPhotoRows(4)).toEqual([2, 2]);
    expect(planPhotoRows(5)).toEqual([3, 2]);
    expect(planPhotoRows(6)).toEqual([3, 3]);
  });

  it("distribui volumes maiores sem perder fotografias", () => {
    expect(planPhotoRows(7)).toEqual([3, 2, 2]);
    expect(planPhotoRows(8)).toEqual([3, 3, 2]);
    expect(planPhotoRows(7).reduce((sum, columns) => sum + columns, 0)).toBe(7);
    expect(planPhotoRows(11).reduce((sum, columns) => sum + columns, 0)).toBe(11);
  });

  it("respeita maxColumns sem descartar fotos", () => {
    expect(planPhotoRows(5, 2)).toEqual([2, 2, 1]);
    expect(planPhotoRows(5, 2).reduce((sum, columns) => sum + columns, 0)).toBe(5);
    expect(planPhotoRows(4, 2)).toEqual([2, 2]);
  });
});

describe("photo cell metrics", () => {
  it("usa o mesmo tamanho de célula na grade de três colunas", () => {
    const three = photoCellWidth(3, PDF_PAGE.contentWidth);
    expect(photoCellHeight(3, PDF_PAGE.contentWidth)).toBeGreaterThan(three * 0.9);
    expect(photoCellWidth(1, PDF_PAGE.contentWidth)).toBeGreaterThan(three);
  });

  it("usa foto grande quando há apenas uma imagem", () => {
    expect(photoCellWidth(1, PDF_PAGE.contentWidth)).toBeGreaterThan(
      photoCellWidth(3, PDF_PAGE.contentWidth),
    );
  });
});

describe("buildPhotoGrid", () => {
  function photo(id: string): LaudoPhoto {
    return {
      id,
      category: "EXT_LATERAL_ESQ",
      display_name: `Foto ${id}`,
      public_url: `https://example.com/${id}.jpg`,
      dataUrl: `data:image/jpeg;base64,${id}`,
    } as LaudoPhoto;
  }

  it("usa duas colunas largas quando há exatamente duas fotos", () => {
    const nodes = buildPhotoGrid([photo("a"), photo("b")], {
      accent: "#ea580c",
      contentWidth: PDF_PAGE.contentWidth,
    });

    expect(nodes).toHaveLength(1);
    expect((nodes[0]?.columns as unknown[]).length).toBe(2);
    const width = (nodes[0]?.columns as Array<{ width: number }>)[0]?.width;
    expect(width).toBe(photoCellWidth(2, PDF_PAGE.contentWidth));
    expect(width).toBeGreaterThan(photoCellWidth(3, PDF_PAGE.contentWidth));
  });

  it("mantém cada célula unbreakable para a legenda não separar da foto", () => {
    const nodes = buildPhotoGrid([photo("a"), photo("b"), photo("c")], {
      accent: "#ea580c",
      contentWidth: PDF_PAGE.contentWidth,
    });

    expect(nodes).toHaveLength(1);
    expect(nodes[0]?.unbreakable).toBe(true);
    const columns = nodes[0]?.columns as unknown[];
    expect(columns).toHaveLength(3);
  });

  it("monta grade 2x2 para quatro fotos, no tamanho da grade de três", () => {
    const nodes = buildPhotoGrid([photo("1"), photo("2"), photo("3"), photo("4")], {
      accent: "#ea580c",
      contentWidth: PDF_PAGE.contentWidth,
    });

    expect(nodes).toHaveLength(2);
    expect((nodes[0]?.columns as unknown[]).length).toBe(3);
    expect((nodes[1]?.columns as unknown[]).length).toBe(3);
    expect((nodes[0]?.columns as Array<{ width: number }>)[0]?.width).toBe(
      (nodes[1]?.columns as Array<{ width: number }>)[0]?.width,
    );
  });

  it("não estica as duas fotos da última linha quando há cinco imagens", () => {
    const nodes = buildPhotoGrid(
      [photo("1"), photo("2"), photo("3"), photo("4"), photo("5")],
      { accent: "#ea580c", contentWidth: PDF_PAGE.contentWidth },
    );
    const first = (nodes[0]?.columns as Array<{ width: number }>)[0]?.width;
    const last = (nodes[1]?.columns as Array<{ width: number }>)[0]?.width;
    expect(first).toBe(last);
  });

  it("encaixa a foto com fit, preservando proporção sem cortar", () => {
    const nodes = buildPhotoGrid([photo("a")], {
      accent: "#ea580c",
      contentWidth: PDF_PAGE.contentWidth,
    });
    expect(JSON.stringify(nodes)).toContain("\"fit\"");
    expect(JSON.stringify(nodes)).not.toContain("\"cover\"");
  });
});

describe("computeDonutSegments", () => {
  it("descarta fatias zeradas e fecha o círculo", () => {
    const segments = computeDonutSegments([
      { label: "Aprovados", value: 8, color: "#16a34a" },
      { label: "Apontamentos", value: 2, color: "#d97706" },
      { label: "Não avaliados", value: 0, color: "#64748b" },
    ]);

    expect(segments).toHaveLength(2);
    expect(segments[0]?.ratio).toBe(0.8);
    expect(segments[1]?.ratio).toBe(0.2);
    expect(segments[0]?.startAngle).toBe(0);
    expect(segments[1]?.endAngle).toBeCloseTo(Math.PI * 2);
  });

  it("retorna vazio quando não há dados positivos", () => {
    expect(computeDonutSegments([{ label: "Vazio", value: 0, color: "#000" }])).toEqual([]);
  });

  it("gera polígono fechado para cada fatia", () => {
    const [segment] = computeDonutSegments([{ label: "Único", value: 1, color: "#16a34a" }]);
    const points = buildRingSectorPoints(segment!, {
      cx: 50,
      cy: 50,
      outerRadius: 40,
      innerRadius: 20,
    });

    expect(points.length).toBeGreaterThan(8);
    const xs = points.map((point) => point.x);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(9);
    expect(Math.max(...xs)).toBeLessThanOrEqual(91);
  });
});

describe("computeGaugeSegments", () => {
  it("reprojeta as fatias para o semicírculo superior", () => {
    const segments = computeGaugeSegments([
      { label: "Aprovado", value: 8, color: "#16a34a" },
      { label: "Apontamento", value: 2, color: "#d97706" },
    ]);

    expect(segments).toHaveLength(2);
    expect(segments[0]?.startAngle).toBeCloseTo(-Math.PI / 2);
    expect(segments[0]?.endAngle).toBeCloseTo(-Math.PI / 2 + 0.8 * Math.PI);
    expect(segments[1]?.endAngle).toBeCloseTo(Math.PI / 2);
  });
});

describe("buildDonutChartNode", () => {
  it("desenha anel nítido com elipses quando há uma única fatia", () => {
    const node = buildDonutChartNode([{ label: "Aprovado", value: 11, color: "#16a34a" }], {
      size: 64,
      centerValue: "11",
      centerLabel: "itens",
    });
    const json = JSON.stringify(node);
    expect(json).toContain("ellipse");
    expect(json).toContain("11");
    expect(json).toContain("ITENS");
  });
});
