import Image from "next/image";
import { cn } from "@/lib/utils";

type Variant = "auto" | "black" | "white";

/**
 * Skalesy wordmark (official asset). `variant="auto"` shows the black wordmark on
 * light surfaces and the white one in dark mode; force `black`/`white` on branded
 * backgrounds (e.g. the gradient rail always uses `white`).
 * Size it with a height class, e.g. `className="h-6"`.
 */
export function Logo({
  className,
  variant = "auto",
}: {
  className?: string;
  variant?: Variant;
}) {
  const dims = { width: 648, height: 200 } as const;
  if (variant === "white") {
    return (
      <Image
        src="/brand/wordmark-white.png"
        alt="Skalesy"
        {...dims}
        className={cn("h-6 w-auto select-none", className)}
      />
    );
  }
  if (variant === "black") {
    return (
      <Image
        src="/brand/wordmark-black.png"
        alt="Skalesy"
        {...dims}
        className={cn("h-6 w-auto select-none", className)}
      />
    );
  }
  return (
    <span
      className={cn("inline-flex h-6 select-none", className)}
      aria-label="Skalesy"
    >
      <Image
        src="/brand/wordmark-black.png"
        alt="Skalesy"
        {...dims}
        className="h-full w-auto dark:hidden"
      />
      <Image
        src="/brand/wordmark-white.png"
        alt=""
        aria-hidden
        {...dims}
        className="hidden h-full w-auto dark:block"
      />
    </span>
  );
}

/** Alias — the wordmark, explicitly named. */
export const LogoWordmark = Logo;

/**
 * Circular gradient `sK` badge (echoes Skalesy's own avatar/monogram treatment) —
 * for the nav, favicons and avatars. Size it with `className="size-8"`.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "gradient-brand relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full",
        className,
      )}
      role="img"
      aria-label="Skalesy"
    >
      <Image
        src="/brand/sk-white.png"
        alt=""
        aria-hidden
        width={501}
        height={480}
        className="h-auto w-[56%]"
      />
    </span>
  );
}

/** Logomark + wordmark side by side. Pass `variant="white"` on dark/branded rails. */
export function LogoLockup({
  className,
  variant = "auto",
}: {
  className?: string;
  variant?: Variant;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-8" />
      <Logo className="h-5" variant={variant} />
    </span>
  );
}
