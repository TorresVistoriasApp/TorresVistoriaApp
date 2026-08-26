/**
 * Família de ícones outline do laudo PDF.
 *
 * Desenhados em canvas pdfmake (line/polyline/ellipse/rect) com espessura e
 * linguagem únicas — sem emoji, sem Unicode ornamental e sem mistura de estilos.
 */
import {
  PDF_COLOR,
  PDF_ICON,
  type PdfNode,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-tokens";

export type PdfIconName =
  | "vehicle"
  | "identification"
  | "document"
  | "checklist"
  | "camera"
  | "structure"
  | "paint"
  | "damage"
  | "opinion"
  | "conclusion"
  | "authenticity"
  | "legal"
  | "inspection"
  | "market"
  | "shield";

type IconGeometry = {
  size: number;
  color: string;
  stroke: number;
};

type CanvasOp = Record<string, unknown>;

function strokeLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  stroke: number,
): CanvasOp {
  return { type: "line", x1, y1, x2, y2, lineWidth: stroke, lineColor: color };
}

function strokePoly(points: Array<{ x: number; y: number }>, color: string, stroke: number, close = false): CanvasOp {
  return {
    type: "polyline",
    points,
    lineWidth: stroke,
    lineColor: color,
    closePath: close,
  };
}

function strokeEllipse(
  x: number,
  y: number,
  r1: number,
  r2: number,
  color: string,
  stroke: number,
): CanvasOp {
  return {
    type: "ellipse",
    x,
    y,
    r1,
    r2,
    lineWidth: stroke,
    lineColor: color,
  };
}

function strokeRect(
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  stroke: number,
  r = 0,
): CanvasOp {
  return {
    type: "rect",
    x,
    y,
    w,
    h,
    r,
    lineWidth: stroke,
    lineColor: color,
  };
}

function drawVehicle({ size, color, stroke }: IconGeometry): CanvasOp[] {
  const s = size;
  return [
    strokePoly(
      [
        { x: s * 0.12, y: s * 0.58 },
        { x: s * 0.22, y: s * 0.4 },
        { x: s * 0.4, y: s * 0.32 },
        { x: s * 0.62, y: s * 0.32 },
        { x: s * 0.78, y: s * 0.42 },
        { x: s * 0.88, y: s * 0.58 },
      ],
      color,
      stroke,
    ),
    strokePoly(
      [
        { x: s * 0.1, y: s * 0.58 },
        { x: s * 0.9, y: s * 0.58 },
        { x: s * 0.9, y: s * 0.7 },
        { x: s * 0.1, y: s * 0.7 },
      ],
      color,
      stroke,
      true,
    ),
    strokeEllipse(s * 0.28, s * 0.74, s * 0.08, s * 0.08, color, stroke),
    strokeEllipse(s * 0.72, s * 0.74, s * 0.08, s * 0.08, color, stroke),
  ];
}

function drawIdentification({ size, color, stroke }: IconGeometry): CanvasOp[] {
  const s = size;
  return [
    strokeRect(s * 0.14, s * 0.28, s * 0.72, s * 0.48, color, stroke, 1.5),
    strokeEllipse(s * 0.34, s * 0.48, s * 0.08, s * 0.08, color, stroke),
    strokeLine(s * 0.5, s * 0.42, s * 0.76, s * 0.42, color, stroke),
    strokeLine(s * 0.5, s * 0.54, s * 0.7, s * 0.54, color, stroke),
  ];
}

function drawDocument({ size, color, stroke }: IconGeometry): CanvasOp[] {
  const s = size;
  return [
    strokePoly(
      [
        { x: s * 0.28, y: s * 0.16 },
        { x: s * 0.62, y: s * 0.16 },
        { x: s * 0.74, y: s * 0.28 },
        { x: s * 0.74, y: s * 0.84 },
        { x: s * 0.28, y: s * 0.84 },
      ],
      color,
      stroke,
      true,
    ),
    strokeLine(s * 0.62, s * 0.16, s * 0.62, s * 0.28, color, stroke),
    strokeLine(s * 0.62, s * 0.28, s * 0.74, s * 0.28, color, stroke),
    strokeLine(s * 0.36, s * 0.42, s * 0.64, s * 0.42, color, stroke),
    strokeLine(s * 0.36, s * 0.54, s * 0.64, s * 0.54, color, stroke),
    strokeLine(s * 0.36, s * 0.66, s * 0.56, s * 0.66, color, stroke),
  ];
}

function drawChecklist({ size, color, stroke }: IconGeometry): CanvasOp[] {
  const s = size;
  return [
    strokeRect(s * 0.24, s * 0.18, s * 0.52, s * 0.68, color, stroke, 1.2),
    strokeLine(s * 0.34, s * 0.36, s * 0.42, s * 0.44, color, stroke),
    strokeLine(s * 0.42, s * 0.44, s * 0.58, s * 0.3, color, stroke),
    strokeLine(s * 0.34, s * 0.54, s * 0.42, s * 0.62, color, stroke),
    strokeLine(s * 0.42, s * 0.62, s * 0.58, s * 0.48, color, stroke),
    strokeLine(s * 0.34, s * 0.72, s * 0.58, s * 0.72, color, stroke),
  ];
}

function drawCamera({ size, color, stroke }: IconGeometry): CanvasOp[] {
  const s = size;
  return [
    strokeRect(s * 0.16, s * 0.34, s * 0.68, s * 0.42, color, stroke, 1.5),
    strokePoly(
      [
        { x: s * 0.34, y: s * 0.34 },
        { x: s * 0.4, y: s * 0.24 },
        { x: s * 0.6, y: s * 0.24 },
        { x: s * 0.66, y: s * 0.34 },
      ],
      color,
      stroke,
    ),
    strokeEllipse(s * 0.5, s * 0.55, s * 0.12, s * 0.12, color, stroke),
    strokeEllipse(s * 0.72, s * 0.44, s * 0.03, s * 0.03, color, stroke),
  ];
}

function drawStructure({ size, color, stroke }: IconGeometry): CanvasOp[] {
  const s = size;
  return [
    strokePoly(
      [
        { x: s * 0.2, y: s * 0.72 },
        { x: s * 0.2, y: s * 0.42 },
        { x: s * 0.5, y: s * 0.22 },
        { x: s * 0.8, y: s * 0.42 },
        { x: s * 0.8, y: s * 0.72 },
      ],
      color,
      stroke,
    ),
    strokeLine(s * 0.2, s * 0.42, s * 0.8, s * 0.42, color, stroke),
    strokeLine(s * 0.5, s * 0.22, s * 0.5, s * 0.72, color, stroke),
    strokeLine(s * 0.32, s * 0.72, s * 0.68, s * 0.72, color, stroke),
  ];
}

function drawPaint({ size, color, stroke }: IconGeometry): CanvasOp[] {
  const s = size;
  return [
    strokeEllipse(s * 0.42, s * 0.42, s * 0.22, s * 0.22, color, stroke),
    strokePoly(
      [
        { x: s * 0.58, y: s * 0.58 },
        { x: s * 0.78, y: s * 0.78 },
        { x: s * 0.72, y: s * 0.84 },
        { x: s * 0.52, y: s * 0.64 },
      ],
      color,
      stroke,
      true,
    ),
    strokeLine(s * 0.3, s * 0.34, s * 0.38, s * 0.3, color, stroke * 0.85),
  ];
}

function drawDamage({ size, color, stroke }: IconGeometry): CanvasOp[] {
  const s = size;
  return [
    strokePoly(
      [
        { x: s * 0.5, y: s * 0.14 },
        { x: s * 0.86, y: s * 0.82 },
        { x: s * 0.14, y: s * 0.82 },
      ],
      color,
      stroke,
      true,
    ),
    strokeLine(s * 0.5, s * 0.36, s * 0.5, s * 0.56, color, stroke),
    strokeEllipse(s * 0.5, s * 0.68, s * 0.035, s * 0.035, color, stroke),
  ];
}

function drawOpinion({ size, color, stroke }: IconGeometry): CanvasOp[] {
  const s = size;
  return [
    ...drawDocument({ size, color, stroke }),
    strokeLine(s * 0.4, s * 0.78, s * 0.52, s * 0.9, color, stroke),
    strokeLine(s * 0.52, s * 0.9, s * 0.7, s * 0.68, color, stroke),
  ];
}

function drawConclusion({ size, color, stroke }: IconGeometry): CanvasOp[] {
  const s = size;
  return [
    strokeEllipse(s * 0.5, s * 0.5, s * 0.34, s * 0.34, color, stroke),
    strokeEllipse(s * 0.5, s * 0.5, s * 0.24, s * 0.24, color, stroke),
    strokeLine(s * 0.38, s * 0.5, s * 0.46, s * 0.58, color, stroke),
    strokeLine(s * 0.46, s * 0.58, s * 0.64, s * 0.4, color, stroke),
  ];
}

function drawAuthenticity({ size, color, stroke }: IconGeometry): CanvasOp[] {
  const s = size;
  return [
    strokePoly(
      [
        { x: s * 0.5, y: s * 0.12 },
        { x: s * 0.82, y: s * 0.28 },
        { x: s * 0.82, y: s * 0.54 },
        { x: s * 0.5, y: s * 0.86 },
        { x: s * 0.18, y: s * 0.54 },
        { x: s * 0.18, y: s * 0.28 },
      ],
      color,
      stroke,
      true,
    ),
    strokeLine(s * 0.38, s * 0.5, s * 0.46, s * 0.58, color, stroke),
    strokeLine(s * 0.46, s * 0.58, s * 0.64, s * 0.4, color, stroke),
  ];
}

function drawLegal({ size, color, stroke }: IconGeometry): CanvasOp[] {
  const s = size;
  return [
    strokeLine(s * 0.5, s * 0.18, s * 0.5, s * 0.72, color, stroke),
    strokeLine(s * 0.28, s * 0.28, s * 0.72, s * 0.28, color, stroke),
    strokeLine(s * 0.28, s * 0.28, s * 0.28, s * 0.42, color, stroke),
    strokeLine(s * 0.72, s * 0.28, s * 0.72, s * 0.42, color, stroke),
    strokeEllipse(s * 0.28, s * 0.46, s * 0.07, s * 0.07, color, stroke),
    strokeEllipse(s * 0.72, s * 0.46, s * 0.07, s * 0.07, color, stroke),
    strokeLine(s * 0.34, s * 0.78, s * 0.66, s * 0.78, color, stroke),
    strokeLine(s * 0.5, s * 0.72, s * 0.5, s * 0.78, color, stroke),
  ];
}

function drawInspection({ size, color, stroke }: IconGeometry): CanvasOp[] {
  const s = size;
  return [
    strokeRect(s * 0.26, s * 0.22, s * 0.48, s * 0.62, color, stroke, 1.2),
    strokeRect(s * 0.38, s * 0.14, s * 0.24, s * 0.1, color, stroke, 1),
    strokeLine(s * 0.36, s * 0.4, s * 0.64, s * 0.4, color, stroke),
    strokeLine(s * 0.36, s * 0.52, s * 0.64, s * 0.52, color, stroke),
    strokeLine(s * 0.36, s * 0.64, s * 0.54, s * 0.64, color, stroke),
  ];
}

function drawMarket({ size, color, stroke }: IconGeometry): CanvasOp[] {
  const s = size;
  return [
    strokeLine(s * 0.22, s * 0.72, s * 0.78, s * 0.72, color, stroke),
    strokeLine(s * 0.28, s * 0.72, s * 0.28, s * 0.42, color, stroke),
    strokeLine(s * 0.46, s * 0.72, s * 0.46, s * 0.3, color, stroke),
    strokeLine(s * 0.64, s * 0.72, s * 0.64, s * 0.5, color, stroke),
    strokePoly(
      [
        { x: s * 0.22, y: s * 0.48 },
        { x: s * 0.4, y: s * 0.34 },
        { x: s * 0.58, y: s * 0.4 },
        { x: s * 0.78, y: s * 0.24 },
      ],
      color,
      stroke,
    ),
  ];
}

function drawShield({ size, color, stroke }: IconGeometry): CanvasOp[] {
  return drawAuthenticity({ size, color, stroke });
}

const ICON_DRAWERS: Record<PdfIconName, (geometry: IconGeometry) => CanvasOp[]> = {
  vehicle: drawVehicle,
  identification: drawIdentification,
  document: drawDocument,
  checklist: drawChecklist,
  camera: drawCamera,
  structure: drawStructure,
  paint: drawPaint,
  damage: drawDamage,
  opinion: drawOpinion,
  conclusion: drawConclusion,
  authenticity: drawAuthenticity,
  legal: drawLegal,
  inspection: drawInspection,
  market: drawMarket,
  shield: drawShield,
};

/** Ícone outline puro, sem moldura. */
export function pdfIcon(
  name: PdfIconName,
  options: { size?: number; color?: string; stroke?: number } = {},
): PdfNode {
  const size = options.size ?? PDF_ICON.size;
  const color = options.color ?? PDF_COLOR.orange;
  const stroke = options.stroke ?? PDF_ICON.stroke;
  const ops = ICON_DRAWERS[name]({ size, color, stroke });

  return {
    width: size,
    canvas: ops,
  };
}

/**
 * Ícone em badge editorial: círculo/quadrado suave com stroke laranja
 * e o pictograma centralizado.
 */
export function pdfIconBadge(
  name: PdfIconName,
  options: {
    size?: number;
    color?: string;
    stroke?: number;
    fill?: string;
    shape?: "circle" | "rounded";
  } = {},
): PdfNode {
  const badge = options.size ?? PDF_ICON.badgeSize;
  const color = options.color ?? PDF_COLOR.orange;
  const stroke = options.stroke ?? PDF_ICON.stroke;
  const iconSize = badge * 0.62;
  const offset = (badge - iconSize) / 2;
  const shape = options.shape ?? "rounded";

  const frame: CanvasOp =
    shape === "circle"
      ? {
          type: "ellipse",
          x: badge / 2,
          y: badge / 2,
          r1: badge / 2 - 0.5,
          r2: badge / 2 - 0.5,
          lineWidth: 0.9,
          lineColor: color,
          color: options.fill ?? PDF_COLOR.orangeSoft,
        }
      : {
          type: "rect",
          x: 0.5,
          y: 0.5,
          w: badge - 1,
          h: badge - 1,
          r: 3,
          lineWidth: 0.9,
          lineColor: color,
          color: options.fill ?? PDF_COLOR.orangeSoft,
        };

  const iconOps = ICON_DRAWERS[name]({ size: iconSize, color, stroke }).map((op) => {
    if (op.type === "line") {
      return {
        ...op,
        x1: (op.x1 as number) + offset,
        y1: (op.y1 as number) + offset,
        x2: (op.x2 as number) + offset,
        y2: (op.y2 as number) + offset,
      };
    }
    if (op.type === "ellipse") {
      return { ...op, x: (op.x as number) + offset, y: (op.y as number) + offset };
    }
    if (op.type === "rect") {
      return { ...op, x: (op.x as number) + offset, y: (op.y as number) + offset };
    }
    if (op.type === "polyline" && Array.isArray(op.points)) {
      return {
        ...op,
        points: (op.points as Array<{ x: number; y: number }>).map((point) => ({
          x: point.x + offset,
          y: point.y + offset,
        })),
      };
    }
    return op;
  });

  return {
    width: badge,
    canvas: [frame, ...iconOps],
  };
}

/**
 * Bandeira do Brasil em geometria vetorial compacta (sem emoji).
 * Uso apenas quando houver origem/nacionalidade informada.
 */
export function brazilFlagIcon(size = 14): PdfNode {
  const w = size * 1.5;
  const h = size;
  const cx = w / 2;
  const cy = h / 2;
  return {
    width: w,
    canvas: [
      { type: "rect", x: 0, y: 0, w, h, r: 1, color: "#009c3b" },
      {
        type: "polyline",
        closePath: true,
        color: "#ffdf00",
        lineWidth: 0,
        points: [
          { x: cx, y: h * 0.14 },
          { x: w * 0.88, y: cy },
          { x: cx, y: h * 0.86 },
          { x: w * 0.12, y: cy },
        ],
      },
      {
        type: "ellipse",
        x: cx,
        y: cy,
        r1: h * 0.2,
        r2: h * 0.2,
        color: "#002776",
      },
    ],
  };
}

/** Mapeia categorias de checklist para ícones da família Torres. */
export function checklistCategoryIcon(categoryKey: string): PdfIconName {
  const key = categoryKey.toUpperCase();
  if (key.includes("ESTRUTURA") || key.includes("LONGARINA")) return "structure";
  if (key.includes("PINTURA") || key.includes("ACABAMENTO")) return "paint";
  if (key.includes("MOTOR")) return "vehicle";
  if (key.includes("INTERIOR")) return "identification";
  if (key.includes("EXTERIOR") || key.includes("FUNILARIA")) return "vehicle";
  if (key.includes("DOC")) return "document";
  if (key.includes("SEGURAN")) return "shield";
  return "checklist";
}
