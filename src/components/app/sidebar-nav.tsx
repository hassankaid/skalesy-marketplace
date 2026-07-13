"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/constants";
import { NAV_GROUPS, isNavItemActive } from "./nav-items";

export function SidebarNav({
  role,
  onNavigate,
  inboxCount = 0,
}: {
  role: UserRole;
  onNavigate?: () => void;
  inboxCount?: number;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5 px-3 py-4">
      {NAV_GROUPS.filter(
        (group) => !group.roles || group.roles.includes(role),
      ).map((group, i) => (
        <div key={group.label ?? `group-${i}`} className="flex flex-col gap-1">
          {group.label && (
            <p className="px-3 pb-1 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.label}
            </p>
          )}
          {group.items
            .filter((item) => !item.roles || item.roles.includes(role))
            .map((item) => {
              const active = isNavItemActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      active
                        ? "text-sidebar-primary"
                        : "text-muted-foreground group-hover:text-sidebar-accent-foreground",
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.href === "/notifications" && inboxCount > 0 && (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-semibold text-white tabular-nums">
                      {inboxCount > 99 ? "99+" : inboxCount}
                    </span>
                  )}
                </Link>
              );
            })}
        </div>
      ))}
    </nav>
  );
}
