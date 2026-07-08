import { format, isPast, isToday, differenceInCalendarDays } from "date-fns";
import { fr } from "date-fns/locale";

export function formatDate(value: string | null, fmt = "d MMM yyyy"): string | null {
  if (!value) return null;
  return format(new Date(value), fmt, { locale: fr });
}

export function formatDateShort(value: string | null): string | null {
  if (!value) return null;
  return format(new Date(value), "d MMM", { locale: fr });
}

/** Human-readable file size in French units (o / Ko / Mo). */
export function formatBytes(value: number | null | undefined): string | null {
  if (value == null) return null;
  if (value < 1024) return `${value} o`;
  const kb = value / 1024;
  if (kb < 1024) return `${Math.round(kb)} Ko`;
  return `${(kb / 1024).toFixed(1)} Mo`;
}

export type DueState = "overdue" | "today" | "soon" | "later";

export function dueState(value: string | null): DueState | null {
  if (!value) return null;
  const d = new Date(value);
  if (isToday(d)) return "today";
  if (isPast(d)) return "overdue";
  const days = differenceInCalendarDays(d, new Date());
  return days <= 3 ? "soon" : "later";
}

export const DUE_STATE_CLASS: Record<DueState, string> = {
  overdue: "text-red-600",
  today: "text-amber-600",
  soon: "text-amber-600",
  later: "text-muted-foreground",
};
