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

export interface NavLinkItem {
  type: "link";
  to: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  end?: boolean;
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

export function getNavSections(isSuperAdmin: boolean): NavSection[] {
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
      items: [
        { type: "link", to: ROUTES.inspections, label: "Vistorias", shortLabel: "Vistorias", icon: Car },
        { type: "link", to: ROUTES.reports, label: "Relatórios", shortLabel: "Relatórios", icon: BarChart3 },
      ],
    },
  ];

  if (isSuperAdmin) {
    sections.push({
      title: "Financeiro",
      items: [
        { type: "link", to: ROUTES.financial, label: "Financeiro", shortLabel: "Financeiro", icon: Wallet, end: true },
      ],
    });

    sections.push({
      title: "Gestão",
      items: [
        { type: "link", to: ROUTES.settingsUsers, label: "Usuários", shortLabel: "Usuários", icon: Users },
        { type: "link", to: ROUTES.settingsAudit, label: "Auditoria", shortLabel: "Auditoria", icon: ClipboardList },
      ],
    });
  }

  sections.push({
    title: "Conta",
    items: [SETTINGS_LINK],
  });

  return sections;
}

/** Navegação plana para a barra inferior mobile (sem seções). */
export const NAV_ITEMS = getNavSections(false)
  .flatMap((section) => section.items)
  .map(({ type: _type, ...item }) => item);
