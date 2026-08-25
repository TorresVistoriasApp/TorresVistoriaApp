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
    pdfColor: "#0f9d6e",
    tone: "success",
    badgeIdle: "border border-success-border bg-success-subtle text-success",
    badgeActive: "border border-success bg-success text-white shadow-soft",
    itemCard: "border-success-border bg-success-subtle",
    itemAccent: "bg-success",
    itemBg: "bg-success-subtle",
    itemIndexBg: "bg-success-subtle text-success",
  },
  [ChecklistStatus.NAO_CONFORME]: {
    label: "Aprovado com Apontamentos",
    shortLabel: "Apontamento",
    mobileLabel: "Apontamento",
    pdfColor: "#d97706",
    tone: "warning",
    badgeIdle: "border border-warning-border bg-warning-subtle text-warning",
    badgeActive: "border border-warning bg-warning text-white shadow-soft",
    itemCard: "border-warning-border bg-warning-subtle",
    itemAccent: "bg-warning",
    itemBg: "bg-warning-subtle",
    itemIndexBg: "bg-warning-subtle text-warning",
    notesBorder: "border-warning-border",
    notesBg: "bg-warning-subtle",
    notesText: "text-warning",
  },
  [ChecklistStatus.NA]: {
    label: "Não Avaliado",
    shortLabel: "N/A",
    mobileLabel: "N/A",
    pdfColor: "#5c6672",
    tone: "muted",
    badgeIdle: "border border-border bg-muted text-muted-foreground",
    badgeActive: "border border-muted-foreground bg-muted-foreground text-white shadow-soft",
    itemCard: "border-border bg-muted",
    itemAccent: "bg-muted-foreground",
    itemBg: "bg-muted",
    itemIndexBg: "bg-muted text-muted-foreground",
  },
  [ChecklistStatus.PENDENTE]: {
    label: "Pendente",
    shortLabel: "Pendente",
    mobileLabel: "Pendente",
    pdfColor: "#e2570c",
    tone: "pending",
    badgeIdle: "border border-brand-border bg-brand-subtle text-brand-emphasis",
    badgeActive: "border border-primary bg-primary text-primary-foreground shadow-soft",
    itemCard: "border-border bg-card",
    itemAccent: "bg-primary",
    itemBg: "bg-brand-subtle",
    itemIndexBg: "bg-brand-subtle text-brand-emphasis",
  },
};

const FALLBACK_META: ChecklistStatusMeta = {
  label: "—",
  shortLabel: "—",
  mobileLabel: "—",
  pdfColor: "#5c6672",
  tone: "muted",
  badgeIdle: "border border-border bg-muted text-muted-foreground",
  badgeActive: "border border-muted-foreground bg-muted-foreground text-white",
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
