import { cn } from "@/lib/utils";

/**
 * Skalesy wordmark — recreated as a styled text lockup (tints via `currentColor`,
 * so it works on light and dark backgrounds).
 *
 * To use the official asset instead, drop `skalesy-black.png` / `skalesy-white.png`
 * into `public/brand/` and swap this component for a <Image>. See public/brand/README.md.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "select-none font-extrabold lowercase tracking-[-0.04em] text-foreground",
        className,
      )}
      aria-label="Skalesy"
    >
      skalesy
    </span>
  );
}

/**
 * Compact logomark (chevron echoing the Skalesy "k") for collapsed nav, avatars
 * and favicons. Violet rounded square with a white chevron.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8", className)}
      role="img"
      aria-label="Skalesy"
    >
      <rect width="32" height="32" rx="8" fill="var(--color-brand)" />
      <path
        d="M20.5 8.5 12 16l8.5 7.5"
        fill="none"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Logomark + wordmark side by side. */
export function LogoLockup({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className="size-7" />
      <Logo className="text-lg" />
    </span>
  );
}
