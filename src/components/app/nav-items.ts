import {
  LayoutDashboard,
  Bell,
  ListChecks,
  MessagesSquare,
  OctagonAlert,
  Gavel,
  Users,
  Briefcase,
  KeyRound,
  Map,
  UsersRound,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/constants";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[];
};

export type NavGroup = {
  label: string | null;
  roles?: UserRole[];
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Suivi",
    items: [
      { href: "/taches", label: "Tâches", icon: ListChecks },
      { href: "/questions", label: "Questions", icon: MessagesSquare },
      { href: "/blocages", label: "Blocages", icon: OctagonAlert },
      { href: "/decisions", label: "Décisions", icon: Gavel },
    ],
  },
  {
    label: "Espaces",
    items: [
      { href: "/prestataires", label: "Prestataires", icon: Users },
      { href: "/client", label: "Espace client", icon: Briefcase },
      { href: "/acces", label: "Accès & documents", icon: KeyRound },
    ],
  },
  {
    label: "Projet",
    items: [
      { href: "/roadmap", label: "Roadmap", icon: Map },
      { href: "/equipe", label: "Équipe", icon: UsersRound },
    ],
  },
  {
    label: "Administration",
    roles: ["skalesy_admin"],
    items: [{ href: "/admin", label: "Administration", icon: Settings }],
  },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
