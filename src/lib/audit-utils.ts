import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { getChecklistStatusLabel } from "@/lib/checklist-status";
import { ChecklistStatus } from "@/lib/enums";
import type { AuditLog } from "@/services/audit-service";

export const AUDIT_ACTIONS = ["INSERT", "UPDATE", "DELETE"] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const ENTITY_LABELS: Record<string, string> = {
  inspections: "Vistoria",
  financial_entries: "Lançamento financeiro",
  profiles: "Usuário",
  settings: "Configurações",
  companies: "Empresa",
  inspection_reports: "Laudo",
  inspection_photos: "Foto da vistoria",
  inspection_checklists: "Checklist",
  inspection_comments: "Comentário",
  notifications: "Notificação",
};

export const ACTION_LABELS: Record<AuditAction, string> = {
  INSERT: "Criação",
  UPDATE: "Alteração",
  DELETE: "Exclusão",
};

export const ACTION_STYLES: Record<AuditAction, string> = {
  INSERT: "bg-emerald-500/10 text-emerald-700 border-emerald-500/25",
  UPDATE: "bg-amber-500/10 text-amber-700 border-amber-500/25",
  DELETE: "bg-red-500/10 text-red-600 border-red-500/25",
};

const FIELD_LABELS: Record<string, string> = {
  full_name: "Nome",
  email: "E-mail",
  role: "Perfil",
  is_active: "Ativo",
  status: "Status",
  plate: "Placa",
  brand: "Marca",
  model: "Modelo",
  client_name: "Cliente",
  inspector_id: "Vistoriador",
  entry_type: "Tipo",
  description: "Descrição",
  amount: "Valor",
  entry_date: "Data",
  inspection_number: "Nº vistoria",
  name: "Nome",
  phone: "Telefone",
  address: "Endereço",
  must_change_password: "Trocar senha",
};

const IGNORED_FIELDS = new Set([
  "updated_at",
  "created_at",
  "deleted_at",
  "id",
  "company_id",
]);

export function getEntityLabel(entityType: string): string {
  return ENTITY_LABELS[entityType] ?? entityType;
}

export function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field.replace(/_/g, " ");
}

export function formatAuditValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      return formatDateTime(value);
    }
    if (
      value === ChecklistStatus.CONFORME ||
      value === ChecklistStatus.NAO_CONFORME ||
      value === ChecklistStatus.NA ||
      value === ChecklistStatus.PENDENTE
    ) {
      return getChecklistStatusLabel(value);
    }
    return value;
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export type AuditChange = {
  field: string;
  label: string;
  before: string;
  after: string;
};

export function getAuditChanges(
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown> | null,
): AuditChange[] {
  const oldRecord = oldData ?? {};
  const newRecord = newData ?? {};
  const keys = new Set([...Object.keys(oldRecord), ...Object.keys(newRecord)]);

  const changes: AuditChange[] = [];

  for (const field of keys) {
    if (IGNORED_FIELDS.has(field)) continue;
    const before = oldRecord[field];
    const after = newRecord[field];
    if (JSON.stringify(before) === JSON.stringify(after)) continue;

    let beforeFormatted = formatAuditValue(before);
    let afterFormatted = formatAuditValue(after);

    if (field === "amount" && (typeof before === "number" || typeof after === "number")) {
      beforeFormatted = before != null ? formatCurrency(Number(before)) : "—";
      afterFormatted = after != null ? formatCurrency(Number(after)) : "—";
    }

    changes.push({
      field,
      label: getFieldLabel(field),
      before: beforeFormatted,
      after: afterFormatted,
    });
  }

  return changes.sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

export function getAuditSummary(log: AuditLog): string {
  const data = (log.new_data ?? log.old_data) as Record<string, unknown> | null;
  if (!data) return getEntityLabel(log.entity_type);

  switch (log.entity_type) {
    case "inspections": {
      const parts: string[] = [];
      if (data.inspection_number) parts.push(`#${data.inspection_number}`);
      if (data.plate) parts.push(String(data.plate));
      if (log.action === "UPDATE" && log.old_data && log.new_data) {
        const oldStatus = (log.old_data as Record<string, unknown>).status;
        const newStatus = (log.new_data as Record<string, unknown>).status;
        if (oldStatus !== newStatus && newStatus) {
          parts.push(`status → ${newStatus}`);
        }
      }
      return parts.length > 0 ? parts.join(" · ") : "Vistoria";
    }
    case "financial_entries":
      return [data.entry_type, data.description, data.amount != null ? formatCurrency(Number(data.amount)) : null]
        .filter(Boolean)
        .join(" · ");
    case "profiles":
      return String(data.full_name ?? "Usuário");
    case "companies":
      return String(data.name ?? "Empresa");
    case "settings":
      return "Configurações da empresa";
    case "inspection_reports":
      return `Laudo v${data.version ?? "—"}`;
    default:
      return getEntityLabel(log.entity_type);
  }
}

export type AuditStats = {
  total: number;
  today: number;
  inserts: number;
  updates: number;
  deletes: number;
};

export function computeAuditStats(logs: AuditLog[]): AuditStats {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return logs.reduce<AuditStats>(
    (acc, log) => {
      acc.total += 1;
      if (new Date(log.created_at) >= todayStart) acc.today += 1;
      if (log.action === "INSERT") acc.inserts += 1;
      else if (log.action === "UPDATE") acc.updates += 1;
      else if (log.action === "DELETE") acc.deletes += 1;
      return acc;
    },
    { total: 0, today: 0, inserts: 0, updates: 0, deletes: 0 },
  );
}
