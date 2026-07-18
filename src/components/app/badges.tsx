import { cn } from "@/lib/utils";
import {
  TASK_STATUS_LABELS,
  STATUS_BADGE_CLASS,
  STATUS_DOT_CLASS,
  PRIORITY_LABELS,
  PRIORITY_BADGE_CLASS,
  PROVIDER_DOMAINS,
  DOMAIN_BADGE_CLASS,
  OWNER_SIDE_LABELS,
  TINT,
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
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        DOMAIN_BADGE_CLASS[domain],
        className,
      )}
    >
      {withIcon && <Icon className="size-3.5" />}
      {d.short}
    </span>
  );
}

const OWNER_BADGE_CLASS: Record<OwnerSide, string> = {
  skalesy: TINT.brand,
  client: TINT.sky,
  provider: TINT.slate,
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
