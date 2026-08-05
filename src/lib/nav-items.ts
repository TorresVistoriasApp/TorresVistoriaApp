import {
  BarChart3,
  Car,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import type { Permission } from "@/lib/rbac";
import type { PermissionChecker } from "@/services/permission-service";

export interface NavLinkItem {
  type: "link";
  to: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  end?: boolean;
  /** Quando definido, o link só aparece se o usuário tiver a permissão. */
  requiredPermission?: Permission;
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

function filterNavItems(items: NavLinkItem[], access: Pick<PermissionChecker, "has">): NavLinkItem[] {
  return items.filter((item) => !item.requiredPermission || access.has(item.requiredPermission));
}

export function getNavSections(access: Pick<PermissionChecker, "has">): NavSection[] {
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

  const financialItems = filterNavItems(
    [
      {
        type: "link",
        to: ROUTES.financial,
        label: "Financeiro",
        shortLabel: "Financeiro",
        icon: Wallet,
        end: true,
        requiredPermission: "financial.manage",
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

/** Navegação plana para a barra inferior mobile (sem seções). */
export const NAV_ITEMS = getNavSections({ has: () => true })
  .flatMap((section) => section.items)
  .map(({ type: _type, ...item }) => item);
