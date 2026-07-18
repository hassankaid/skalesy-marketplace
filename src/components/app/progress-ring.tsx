import { cn } from "@/lib/utils";

/** Circular progress in the brand gradient — the dashboard's signature moment. */
export function ProgressRing({
  value,
  size = 128,
  stroke = 11,
  label = "avancement",
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <defs>
          <linearGradient id="progressRingBrand" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4a0094" />
            <stop offset="45%" stopColor="#7a0a8a" />
            <stop offset="75%" stopColor="#a13360" />
            <stop offset="100%" stopColor="#db6d25" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#progressRingBrand)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular-nums tracking-tight">
          {pct}%
        </span>
        {label && (
          <span className="text-[0.68rem] text-muted-foreground">{label}</span>
        )}
      </div>
    </div>
  );
}
