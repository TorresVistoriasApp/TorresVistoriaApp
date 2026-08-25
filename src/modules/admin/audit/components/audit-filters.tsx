import { Search } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { ACTION_LABELS, ENTITY_LABELS } from "@/modules/admin/audit/utils/audit-presentation";
import { AUDIT_APP_ACTIONS, AUDIT_DML_ACTIONS } from "@/core/audit/audit-actions";
import type { AuditFilters } from "@/core/audit/audit-service";
import type { TeamProfile } from "@/modules/admin/users/services/user-service";

type AuditFiltersBarProps = {
  filters: AuditFilters;
  search: string;
  team: TeamProfile[];
  onFiltersChange: (filters: AuditFilters) => void;
  onSearchChange: (search: string) => void;
};

const ACTION_GROUPS = [
  { label: "Todas ações", value: undefined },
  ...AUDIT_DML_ACTIONS.map((action) => ({ label: ACTION_LABELS[action], value: action })),
  ...AUDIT_APP_ACTIONS.map((action) => ({ label: ACTION_LABELS[action], value: action })),
] as const;

export function AuditFiltersBar({
  filters,
  search,
  team,
  onFiltersChange,
  onSearchChange,
}: AuditFiltersBarProps) {
  const entityTypes = Object.keys(ENTITY_LABELS).sort((a, b) =>
    ENTITY_LABELS[a].localeCompare(ENTITY_LABELS[b], "pt-BR"),
  );

  return (
    <div className="ui-panel space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap gap-2">
        {ACTION_GROUPS.map((group) => (
          <button
            key={group.label}
            type="button"
            onClick={() => onFiltersChange({ ...filters, action: group.value })}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filters.action === group.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-brand-subtle hover:text-primary"
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por resumo ou ID..."
            className="touch-target pl-10"
          />
        </div>

        <select
          value={filters.entityType ?? ""}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              entityType: event.target.value || undefined,
            })
          }
          className="flex h-11 touch-target rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todas entidades</option>
          {entityTypes.map((type) => (
            <option key={type} value={type}>
              {ENTITY_LABELS[type]}
            </option>
          ))}
        </select>

        <select
          value={filters.userId ?? ""}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              userId: event.target.value || undefined,
            })
          }
          className="flex h-11 touch-target rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos usuários</option>
          {team.map((member) => (
            <option key={member.id} value={member.id}>
              {member.full_name}
            </option>
          ))}
        </select>

        <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
          <input
            type="date"
            value={filters.startDate ?? ""}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                startDate: event.target.value || undefined,
              })
            }
            className="flex h-11 min-w-0 flex-1 touch-target rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Data inicial"
          />
          <input
            type="date"
            value={filters.endDate ?? ""}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                endDate: event.target.value || undefined,
              })
            }
            className="flex h-11 min-w-0 flex-1 touch-target rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Data final"
          />
        </div>
      </div>
    </div>
  );
}
