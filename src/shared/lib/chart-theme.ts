/** Paleta e estilos compartilhados dos gráficos Recharts */

/** Espelha os tokens de src/styles/globals.css — não introduzir cor fora do @theme */
export const CHART_COLORS = {
  primary: "#e2570c",
  primaryLight: "#f97316",
  primaryDark: "#b4400a",
  primarySoft: "#fff5ed",
  neutral: "#10151c",
  neutralMid: "#5c6672",
  neutralLight: "#8a939e",
  amber: "#d97706",
  grid: "#e4e7eb",
  gridDark: "#2b3644",
  tooltipBorder: "#e4e7eb",
  surface: "#ffffff",
  success: "#0f9d6e",
  danger: "#dc2626",
} as const;

/** Séries distinguíveis usando apenas a paleta da marca */
export const CHART_SERIES_PALETTE = [
  "#e2570c", // primary
  "#131a23", // ink
  "#d97706", // warning
  "#b4400a", // brand-emphasis
  "#8a939e", // subtle-foreground
  "#f97316", // accent
] as const;

export function getSeriesColor(index: number): string {
  return CHART_SERIES_PALETTE[index % CHART_SERIES_PALETTE.length] ?? CHART_COLORS.primary;
}

export const chartTooltipStyle = {
  contentStyle: {
    borderRadius: "1.125rem",
    border: `1px solid ${CHART_COLORS.tooltipBorder}`,
    backgroundColor: CHART_COLORS.surface,
    boxShadow: "0 2px 4px rgb(16 21 28 / 0.04), 0 12px 28px rgb(16 21 28 / 0.08)",
    fontSize: "13px",
    padding: "10px 14px",
  },
  labelStyle: { fontWeight: 700, color: CHART_COLORS.neutral, marginBottom: 4 },
  itemStyle: { color: CHART_COLORS.neutralMid, fontWeight: 600 },
  cursor: { stroke: CHART_COLORS.neutralLight, strokeWidth: 1, strokeDasharray: "4 4" },
};

export const chartAxisStyle = {
  tick: { fontSize: 11, fill: CHART_COLORS.neutralLight, fontWeight: 600 },
  axisLine: false as const,
  tickLine: false as const,
};

export function formatMonthLabel(month: string) {
  const [year, m] = month.split("-");
  const names = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return `${names[Number(m) - 1] ?? m}/${year.slice(2)}`;
}

export function formatMonthRangeLabel(startMonth: string, endMonth: string) {
  const [startYear, startM] = startMonth.split("-");
  const [endYear, endM] = endMonth.split("-");
  const names = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  const startLabel = names[Number(startM) - 1] ?? startM;
  const endLabel = names[Number(endM) - 1] ?? endM;

  if (startYear === endYear) {
    return `${startLabel} a ${endLabel} de ${startYear}`;
  }

  return `${startLabel}/${startYear.slice(2)} a ${endLabel}/${endYear.slice(2)}`;
}

/** Escala Y com respiro — evita ponto/barra colados no topo com poucos dados */
export function yAxisUpperBound(maxValue: number): number {
  if (maxValue <= 0) return 5;
  if (maxValue <= 3) return maxValue + 1;
  return Math.ceil(maxValue * 1.25);
}

export function yAxisRevenueUpperBound(maxValue: number): number {
  if (maxValue <= 0) return 1000;
  return Math.ceil(maxValue * 1.2);
}
