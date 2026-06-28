import { cn } from "@/lib/utils";
import {
  TASK_STATUS_LABELS,
  STATUS_BADGE_CLASS,
  STATUS_DOT_CLASS,
  PRIORITY_LABELS,
  PRIORITY_BADGE_CLASS,
  PROVIDER_DOMAINS,
  OWNER_SIDE_LABELS,
  type TaskStatus,
  type Priority,
  type ProviderDomain,
  type OwnerSide,
} from "@/lib/constants";

export function StatusBadge({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_BADGE_CLASS[status],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", STATUS_DOT_CLASS[status])} />
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        PRIORITY_BADGE_CLASS[priority],
        className,
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function DomainBadge({
  domain,
  className,
  withIcon = true,
}: {
  domain: ProviderDomain | null;
  className?: string;
  withIcon?: boolean;
}) {
  if (!domain) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground",
          className,
        )}
      >
        Transverse
      </span>
    );
  }
  const d = PROVIDER_DOMAINS[domain];
  const Icon = d.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground/80 whitespace-nowrap",
        className,
      )}
    >
      {withIcon && <Icon className="size-3.5 text-muted-foreground" />}
      {d.short}
    </span>
  );
}

const OWNER_BADGE_CLASS: Record<OwnerSide, string> = {
  skalesy: "bg-violet-100 text-violet-700 ring-1 ring-violet-200",
  client: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
  provider: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
};

export function OwnerBadge({
  owner,
  className,
}: {
  owner: OwnerSide;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        OWNER_BADGE_CLASS[owner],
        className,
      )}
    >
      {OWNER_SIDE_LABELS[owner]}
    </span>
  );
}
