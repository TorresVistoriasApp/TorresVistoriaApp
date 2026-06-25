import type { Inspection } from "@/services/inspection-service";
import { formatPlate } from "@/lib/formatters";
import {
  buildMercosulPlateLocationLabel,
  fitLocationFontSize,
  fitPlateNumberFontSize,
  getMercosulPlateColumnWidths,
  mercosulPlateGraphicWidth,
  MERCOSUL_BLUE,
  MERCOSUL_PLATE_BODY_HEIGHT,
  MERCOSUL_PLATE_BR_COL,
  MERCOSUL_PLATE_HEADER_HEIGHT,
  MERCOSUL_PLATE_TOTAL_HEIGHT,
  PLATE_BORDER,
} from "@/lib/laudo/mercosul-plate-layout";

export function MercosulPlate({
  plate,
  inspection,
  className,
}: {
  plate: string | null | undefined;
  inspection: Pick<Inspection, "registration_city_uf" | "vehicle_uf">;
  className?: string;
}) {
  const plateText = formatPlate(plate);
  const locationLabel = buildMercosulPlateLocationLabel(inspection);
  const graphicWidth = mercosulPlateGraphicWidth(plateText);
  const [, locationColWidth] = getMercosulPlateColumnWidths(graphicWidth);
  const locationFontSize = fitLocationFontSize(locationLabel, locationColWidth - 2);
  const plateFontSize = fitPlateNumberFontSize(plateText, graphicWidth - 4);

  return (
    <div
      className={className}
      style={{
        width: graphicWidth,
        height: MERCOSUL_PLATE_TOTAL_HEIGHT,
        border: `0.5px solid ${PLATE_BORDER}`,
        boxSizing: "border-box",
        display: "grid",
        gridTemplateRows: `${MERCOSUL_PLATE_HEADER_HEIGHT}px ${MERCOSUL_PLATE_BODY_HEIGHT}px`,
        overflow: "hidden",
        background: "#ffffff",
      }}
      aria-label={`Placa ${plateText}`}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `${MERCOSUL_PLATE_BR_COL}px 1fr`,
          background: MERCOSUL_BLUE,
          borderBottom: `0.5px solid ${PLATE_BORDER}`,
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: 3.6,
            fontWeight: 700,
            lineHeight: 1,
            borderRight: `0.5px solid ${PLATE_BORDER}`,
          }}
        >
          BR
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: locationFontSize,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "0.1px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            paddingInline: 2,
          }}
        >
          {locationLabel}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: plateFontSize,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "0.45px",
          color: "#0f172a",
        }}
      >
        {plateText}
      </div>
    </div>
  );
}
