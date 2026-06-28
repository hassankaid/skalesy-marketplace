import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  tone = "default",
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon?: LucideIcon;
  href?: string;
  tone?: "default" | "brand" | "warning" | "danger" | "success";
}) {
  const toneClass: Record<string, string> = {
    default: "text-muted-foreground",
    brand: "text-brand",
    warning: "text-amber-500",
    danger: "text-red-500",
    success: "text-emerald-500",
  };

  const inner = (
    <div className="group flex h-full flex-col justify-between gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-foreground/15">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && <Icon className={cn("size-4", toneClass[tone])} />}
      </div>
      <div className="space-y-0.5">
        <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
