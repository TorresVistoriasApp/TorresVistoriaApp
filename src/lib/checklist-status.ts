import { ChecklistStatus } from "@/lib/enums";

export type ChecklistStatusTone = "success" | "warning" | "muted" | "pending";

export type ChecklistStatusMeta = {
  label: string;
  shortLabel: string;
  mobileLabel: string;
  pdfColor: string;
  tone: ChecklistStatusTone;
  badgeIdle: string;
  badgeActive: string;
  itemBg?: string;
  itemIndexBg?: string;
  notesBorder?: string;
  notesBg?: string;
  notesText?: string;
};

const CHECKLIST_STATUS_META: Record<ChecklistStatus, ChecklistStatusMeta> = {
  [ChecklistStatus.CONFORME]: {
    label: "✔ Aprovado",
    shortLabel: "Aprovado",
    mobileLabel: "Aprovado",
    pdfColor: "#16a34a",
    tone: "success",
    badgeIdle: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200",
    badgeActive: "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30",
  },
  [ChecklistStatus.NAO_CONFORME]: {
    label: "⚠ Aprovado com Ressalvas",
    shortLabel: "Ressalvas",
    mobileLabel: "Ressalvas",
    pdfColor: "#d97706",
    tone: "warning",
    badgeIdle: "bg-amber-50 text-amber-800 hover:bg-amber-100 active:bg-amber-200",
    badgeActive: "bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/30",
    itemBg: "bg-amber-50/40",
    itemIndexBg: "bg-amber-100 text-amber-800",
    notesBorder: "border-amber-400/50",
    notesBg: "bg-amber-50/60",
    notesText: "text-amber-800",
  },
  [ChecklistStatus.NA]: {
    label: "○ Não Avaliado",
    shortLabel: "Não Avaliado",
    mobileLabel: "N/A",
    pdfColor: "#64748b",
    tone: "muted",
    badgeIdle: "bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300",
    badgeActive: "bg-slate-500 text-white shadow-sm ring-2 ring-slate-500/30",
  },
  [ChecklistStatus.PENDENTE]: {
    label: "Pendente",
    shortLabel: "Pendente",
    mobileLabel: "Pendente",
    pdfColor: "#f59e0b",
    tone: "pending",
    badgeIdle: "bg-amber-50 text-amber-700 hover:bg-amber-100 active:bg-amber-200",
    badgeActive: "bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/30",
    itemBg: "bg-amber-50/40",
    itemIndexBg: "bg-amber-100 text-amber-800",
  },
};

const FALLBACK_META: ChecklistStatusMeta = {
  label: "—",
  shortLabel: "—",
  mobileLabel: "—",
  pdfColor: "#64748b",
  tone: "muted",
  badgeIdle: "bg-muted text-muted-foreground",
  badgeActive: "bg-muted-foreground text-white",
};

export function getChecklistStatusMeta(status: string): ChecklistStatusMeta {
  return CHECKLIST_STATUS_META[status as ChecklistStatus] ?? FALLBACK_META;
}

export function getChecklistStatusLabel(status: string): string {
  return getChecklistStatusMeta(status).label;
}

export function getChecklistStatusShortLabel(status: string): string {
  return getChecklistStatusMeta(status).shortLabel;
}

export function getChecklistStatusPdfColor(status: string): string {
  return getChecklistStatusMeta(status).pdfColor;
}

export const CHECKLIST_RESSALVAS_FILTER_LABEL = "Com ressalvas";
