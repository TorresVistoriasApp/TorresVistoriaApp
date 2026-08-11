import {
  BarChart3,
  Car,
  ClipboardList,
  LayoutDashboard,
  ScanSearch,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import { isEnabled } from "@/core/feature-flags";
import type { Permission } from "@/core/rbac/permissions";
import type { PermissionChecker } from "@/core/rbac/permission-service";

export interface NavLinkItem {
  type: "link";
  to: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  end?: boolean;
  /** Quando definido, o link só aparece se o usuário tiver a permissão. */
  requiredPermission?: Permission;
  /** Quando definido, o link aparece se o usuário tiver qualquer uma das permissões. */
  requiredAnyOf?: Permission[];
}

export interface NavSection {
  title: string;
  items: NavLinkItem[];
}

const SETTINGS_LINK: NavLinkItem = {
  type: "link",
  to: ROUTES.settings,
  label: "Configurações",
  shortLabel: "Config",
  icon: Settings,
  end: true,
};

function filterNavItems(items: NavLinkItem[], access: Pick<PermissionChecker, "has" | "hasAny">): NavLinkItem[] {
  return items.filter((item) => {
    if (item.requiredAnyOf?.length) return access.hasAny(...item.requiredAnyOf);
    if (item.requiredPermission) return access.has(item.requiredPermission);
    return true;
  });
}

export function getNavSections(access: Pick<PermissionChecker, "has" | "hasAny">): NavSection[] {
  const sections: NavSection[] = [
    {
      title: "Visão geral",
      items: [
        {
          type: "link",
          to: ROUTES.dashboard,
          label: "Dashboard",
          shortLabel: "Início",
          icon: LayoutDashboard,
          end: true,
        },
      ],
    },
    {
      title: "Operação",
      items: filterNavItems(
        [
          { type: "link", to: ROUTES.inspections, label: "Vistorias", shortLabel: "Vistorias", icon: Car },
          {
            type: "link",
            to: ROUTES.reports,
            label: "Relatórios",
            shortLabel: "Relatórios",
            icon: BarChart3,
            requiredPermission: "reports.export",
          },
        ],
        access,
      ),
    },
  ];

  if (isEnabled("torres-consulta")) {
    const consultaItems = filterNavItems(
      [
        {
          type: "link",
          to: ROUTES.consultaNew,
          label: "Consulta veicular",
          shortLabel: "Consulta",
          icon: ScanSearch,
          requiredAnyOf: ["consulta.create", "consulta.read.own"],
        },
      ],
      access,
    );
    if (consultaItems.length > 0) {
      sections.push({ title: "Torres Consulta", items: consultaItems });
    }
  }

  const financialItems = filterNavItems(
    [
      {
        type: "link",
        to: ROUTES.financial,
        label: "Financeiro",
        shortLabel: "Financeiro",
        icon: Wallet,
        end: true,
        requiredAnyOf: ["financial.manage", "financial.read.own"],
      },
    ],
    access,
  );
  if (financialItems.length > 0) {
    sections.push({ title: "Financeiro", items: financialItems });
  }

  const managementItems = filterNavItems(
    [
      {
        type: "link",
        to: ROUTES.users,
        label: "Usuários",
        shortLabel: "Usuários",
        icon: Users,
        requiredPermission: "users.manage",
      },
      {
        type: "link",
        to: ROUTES.audit,
        label: "Auditoria",
        shortLabel: "Auditoria",
        icon: ClipboardList,
        requiredPermission: "users.manage",
      },
    ],
    access,
  );
  if (managementItems.length > 0) {
    sections.push({ title: "Gestão", items: managementItems });
  }

  sections.push({
    title: "Conta",
    items: [SETTINGS_LINK],
  });

  return sections;
}

/** Navegação plana (sem seções) para a barra inferior mobile, já filtrada por permissão. */
export function getNavItems(access: Pick<PermissionChecker, "has" | "hasAny">): NavLinkItem[] {
  return getNavSections(access).flatMap((section) => section.items);
}
