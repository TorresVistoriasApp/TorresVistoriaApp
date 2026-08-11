export type ScoreLevel = "excelente" | "bom" | "atencao" | "critico";

export const SAMPLE_VEHICLE_PHOTOS = [
  {
    src: "/images/consultations/sample-report/front.webp",
    alt: "Volkswagen T-Cross — vista frontal",
    label: "Frontal",
  },
  {
    src: "/images/consultations/sample-report/rear.webp",
    alt: "Volkswagen T-Cross — vista traseira",
    label: "Traseira",
  },
  {
    src: "/images/consultations/sample-report/side.webp",
    alt: "Volkswagen T-Cross — perfil lateral",
    label: "Lateral",
  },
  {
    src: "/images/consultations/sample-report/interior.webp",
    alt: "Volkswagen T-Cross — interior e painel",
    label: "Interior",
  },
] as const;

export const SAMPLE_VEHICLE = {
  marca: "Volkswagen",
  modelo: "T-Cross Highline 1.4 TSI",
  ano: "2021/2022",
  placa: "BRA2E19",
  chassi: "9BWZZZ377VT004***",
  cor: "Branco Puro",
  categoria: "SUV / Utilitário",
  score: 82 as number,
  scoreLevel: "bom" as ScoreLevel,
  consultaEm: "05/08/2026 às 14:32",
  protocolo: "TC-2026-0847291",
};

export const SAMPLE_STATUS_CARDS = [
  { id: "leilao", label: "Leilão", status: "ok" as const, detail: "Nenhum registro encontrado" },
  { id: "sinistros", label: "Sinistros", status: "warn" as const, detail: "1 ocorrência leve (2019)" },
  { id: "roubo", label: "Roubo/Furto", status: "ok" as const, detail: "Sem restrições" },
  { id: "recall", label: "Recall", status: "ok" as const, detail: "Campanhas em dia" },
  { id: "restricoes", label: "Restrições", status: "ok" as const, detail: "Nenhuma restrição ativa" },
  { id: "alienacao", label: "Alienação", status: "ok" as const, detail: "Sem gravame" },
  { id: "debitos", label: "Débitos", status: "warn" as const, detail: "IPVA 2025 pendente" },
  { id: "multas", label: "Multas", status: "ok" as const, detail: "Nenhuma multa ativa" },
] as const;

export const SAMPLE_TIMELINE = [
  { date: "03/2019", event: "Primeiro emplacamento", type: "info" as const },
  { date: "11/2019", event: "Sinistro leve no para choque traseiro", type: "warn" as const },
  { date: "06/2021", event: "Transferência de propriedade", type: "info" as const },
  { date: "02/2023", event: "Vistoria cautelar aprovada", type: "ok" as const },
  { date: "01/2025", event: "Última atualização de dados", type: "info" as const },
] as const;

export const SCORE_LABELS: Record<ScoreLevel, string> = {
  excelente: "Excelente",
  bom: "Bom",
  atencao: "Atenção",
  critico: "Crítico",
};

export const SCORE_COLORS: Record<ScoreLevel, string> = {
  excelente: "text-emerald-600",
  bom: "text-sky-600",
  atencao: "text-amber-600",
  critico: "text-red-600",
};
