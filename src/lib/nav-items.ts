import {
  BarChart3,
  Car,
  LayoutDashboard,
  Settings,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

export interface NavItem {
  to: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.dashboard, label: "Dashboard", shortLabel: "Início", icon: LayoutDashboard },
  { to: ROUTES.inspections, label: "Vistorias", shortLabel: "Vistorias", icon: Car },
  { to: ROUTES.financial, label: "Financeiro", shortLabel: "Financeiro", icon: Wallet },
  { to: ROUTES.reports, label: "Relatórios", shortLabel: "Relatórios", icon: BarChart3 },
  { to: ROUTES.settings, label: "Configurações", shortLabel: "Config", icon: Settings },
];
