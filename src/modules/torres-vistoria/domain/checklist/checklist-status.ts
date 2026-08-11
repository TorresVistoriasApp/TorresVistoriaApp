import { ChecklistStatus } from "@/modules/torres-vistoria/domain/enums";

export type ChecklistStatusTone = "success" | "warning" | "muted" | "pending";

export type ChecklistStatusMeta = {
  label: string;
  shortLabel: string;
  mobileLabel: string;
  pdfColor: string;
  tone: ChecklistStatusTone;
  badgeIdle: string;
  badgeActive: string;
  /** Fundo/borda do card do item no checklist compacto. */
  itemCard: string;
  /** Barra lateral de status (leitura rápida). */
  itemAccent: string;
  itemBg?: string;
  itemIndexBg?: string;
  notesBorder?: string;
  notesBg?: string;
  notesText?: string;
};

const CHECKLIST_STATUS_META: Record<ChecklistStatus, ChecklistStatusMeta> = {
  [ChecklistStatus.CONFORME]: {
    label: "Aprovado",
    shortLabel: "Aprovado",
    mobileLabel: "Aprovado",
    pdfColor: "#16a34a",
    tone: "success",
    badgeIdle: "bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 active:bg-emerald-200",
    badgeActive: "bg-emerald-600 text-white border border-emerald-600 shadow-sm",
    itemCard: "border-emerald-200 bg-emerald-50/70",
    itemAccent: "bg-emerald-500",
    itemBg: "bg-emerald-50/40",
    itemIndexBg: "bg-emerald-100 text-emerald-800",
  },
  [ChecklistStatus.NAO_CONFORME]: {
    label: "Aprovado com Apontamentos",
    shortLabel: "Apontamento",
    mobileLabel: "Apontamento",
    pdfColor: "#d97706",
    tone: "warning",
    badgeIdle: "bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 active:bg-amber-200",
    badgeActive: "bg-amber-500 text-white border border-amber-500 shadow-sm",
    itemCard: "border-amber-300 bg-amber-50/80",
    itemAccent: "bg-amber-500",
    itemBg: "bg-amber-50/40",
    itemIndexBg: "bg-amber-100 text-amber-800",
    notesBorder: "border-amber-400/50",
    notesBg: "bg-amber-50/60",
    notesText: "text-amber-800",
  },
  [ChecklistStatus.NA]: {
    label: "Não Avaliado",
    shortLabel: "N/A",
    mobileLabel: "N/A",
    pdfColor: "#64748b",
    tone: "muted",
    badgeIdle: "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 active:bg-slate-300",
    badgeActive: "bg-slate-500 text-white border border-slate-500 shadow-sm",
    itemCard: "border-slate-200 bg-slate-50/90",
    itemAccent: "bg-slate-400",
    itemBg: "bg-slate-50",
    itemIndexBg: "bg-slate-200 text-slate-700",
  },
  [ChecklistStatus.PENDENTE]: {
    label: "Pendente",
    shortLabel: "Pendente",
    mobileLabel: "Pendente",
    pdfColor: "#f59e0b",
    tone: "pending",
    badgeIdle: "bg-orange-50 text-orange-800 border border-orange-200/70 hover:bg-orange-100 active:bg-orange-200",
    badgeActive: "bg-orange-500 text-white border border-orange-500 shadow-sm",
    itemCard: "border-border bg-card",
    itemAccent: "bg-orange-400",
    itemBg: "bg-orange-50/30",
    itemIndexBg: "bg-orange-100 text-orange-800",
  },
};

const FALLBACK_META: ChecklistStatusMeta = {
  label: "—",
  shortLabel: "—",
  mobileLabel: "—",
  pdfColor: "#64748b",
  tone: "muted",
  badgeIdle: "bg-muted text-muted-foreground border border-transparent",
  badgeActive: "bg-muted-foreground text-white border border-transparent",
  itemCard: "border-border bg-card",
  itemAccent: "bg-muted-foreground",
};

export function getChecklistStatusMeta(status: string): ChecklistStatusMeta {
  return CHECKLIST_STATUS_META[status as ChecklistStatus] ?? FALLBACK_META;
}

export function getChecklistStatusLabel(status: string): string {
  return getChecklistStatusMeta(status).label;
}

/** Rótulo sem ícones/símbolos prefixados — uso no laudo PDF. */
export function getChecklistStatusPdfLabel(status: string): string {
  return getChecklistStatusLabel(status).replace(/^[\s○✔✓⚠•●◦▪►]+/u, "").trim();
}

export function getChecklistStatusShortLabel(status: string): string {
  return getChecklistStatusMeta(status).shortLabel;
}

export function getChecklistStatusPdfColor(status: string): string {
  return getChecklistStatusMeta(status).pdfColor;
}

export const CHECKLIST_APONTAMENTOS_FILTER_LABEL = "Com apontamentos";
