"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/constants";
import { NAV_GROUPS, isNavItemActive } from "./nav-items";

/**
 * Navigation for the gradient brand rail (desktop) and the mobile sheet — both
 * paint `.gradient-rail`, so items are styled white-on-gradient in both.
 */
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
    <nav className="flex flex-col gap-6 px-3 py-5">
      {NAV_GROUPS.filter(
        (group) => !group.roles || group.roles.includes(role),
      ).map((group, i) => (
        <div key={group.label ?? `group-${i}`} className="flex flex-col gap-1">
          {group.label && (
            <p className="px-3 pb-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/45">
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
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-white/15 text-white ring-1 ring-inset ring-white/10"
                      : "text-white/70 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      active
                        ? "text-white"
                        : "text-white/55 group-hover:text-white",
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.href === "/notifications" && inboxCount > 0 && (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-semibold text-brand tabular-nums">
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
