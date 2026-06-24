/** Paleta e estilos compartilhados dos gráficos Recharts */

export const CHART_COLORS = {
  primary: "#EA580C",
  primaryLight: "#FB923C",
  primaryDark: "#C2410C",
  primarySoft: "#FFEDD5",
  neutral: "#292524",
  neutralMid: "#57534E",
  neutralLight: "#A8A29E",
  amber: "#D97706",
  grid: "#E2E8F0",
  gridDark: "#334155",
  tooltipBorder: "#FED7AA",
  success: "#16A34A",
  danger: "#DC2626",
} as const;

/** Cores distintas que harmonizam com o laranja da marca */
export const CHART_SERIES_PALETTE = [
  "#EA580C", // laranja principal
  "#292524", // stone escuro
  "#D97706", // âmbar
  "#9A3412", // laranja queimado
  "#78716C", // stone médio
  "#F97316", // laranja vivo
] as const;

export function getSeriesColor(index: number): string {
  return CHART_SERIES_PALETTE[index % CHART_SERIES_PALETTE.length] ?? CHART_COLORS.primary;
}

export const chartTooltipStyle = {
  contentStyle: {
    borderRadius: "14px",
    border: `1px solid ${CHART_COLORS.tooltipBorder}`,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 12px 32px rgb(234 88 12 / 0.12)",
    fontSize: "13px",
    padding: "12px 16px",
  },
  labelStyle: { fontWeight: 700, color: CHART_COLORS.neutral, marginBottom: 4 },
  itemStyle: { color: CHART_COLORS.neutralMid, fontWeight: 600 },
  cursor: { stroke: CHART_COLORS.primary, strokeWidth: 1, strokeDasharray: "4 4" },
};

export const chartAxisStyle = {
  tick: { fontSize: 11, fill: "#64748B", fontWeight: 500 },
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
