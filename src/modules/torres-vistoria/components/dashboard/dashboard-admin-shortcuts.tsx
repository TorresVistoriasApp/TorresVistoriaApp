import { Link } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import type { Permission } from "@/core/rbac/permissions";
import { usePermission } from "@/core/rbac/use-permission";

type Shortcut = {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
  permission: Permission;
};

const ADMIN_SHORTCUTS: Shortcut[] = [
  {
    to: ROUTES.financial,
    label: "Financeiro",
    description: "Receitas, despesas e resumo da empresa",
    icon: Wallet,
    permission: "financial.manage",
  },
  {
    to: ROUTES.users,
    label: "Usuários",
    description: "Equipe, convites e papéis",
    icon: Users,
    permission: "users.manage",
  },
  {
    to: ROUTES.audit,
    label: "Auditoria",
    description: "Histórico de ações no sistema",
    icon: ClipboardList,
    permission: "users.manage",
  },
  {
    to: ROUTES.reports,
    label: "Relatórios",
    description: "Exportações e análises",
    icon: BarChart3,
    permission: "reports.export",
  },
];

export function DashboardAdminShortcuts() {
  const { can } = usePermission();
  const items = ADMIN_SHORTCUTS.filter((item) => can(item.permission));

  if (items.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="surface-interactive group flex items-start gap-3 rounded-2xl border border-border/60 p-4 transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <item.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold group-hover:text-primary">{item.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
