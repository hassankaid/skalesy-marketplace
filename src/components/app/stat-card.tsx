import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Tone = "default" | "brand" | "warning" | "danger" | "success";

/** Icon-chip treatment per tone (the number stays monochrome for legibility). */
const CHIP_CLASS: Record<Tone, string> = {
  default: "bg-muted text-muted-foreground",
  brand: "gradient-brand text-white",
  warning: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  danger: "bg-red-500/12 text-red-600 dark:text-red-400",
  success: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
};

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
  tone?: Tone;
}) {
  const inner = (
    <div className="group shadow-card flex h-full flex-col justify-between gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              CHIP_CLASS[tone],
            )}
          >
            <Icon className="size-[1.15rem]" />
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        <p className="text-3xl font-semibold tabular-nums tracking-tight">
          {value}
        </p>
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
