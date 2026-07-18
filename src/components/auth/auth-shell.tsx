import Image from "next/image";
import { LogoLockup, LogoMark, Logo } from "@/components/brand/logo";

/**
 * Split-screen auth frame: a full brand-gradient panel (desktop) beside the form.
 * On mobile the panel collapses to a compact brand header above the form.
 */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel — desktop only */}
      <aside className="gradient-brand relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-16 size-80 rounded-full bg-white/15 blur-3xl"
        />
        <Image
          src="/brand/sk-white.png"
          alt=""
          aria-hidden
          width={501}
          height={480}
          className="pointer-events-none absolute -right-12 -bottom-16 w-[26rem] opacity-[0.07]"
        />

        <div className="relative">
          <LogoLockup variant="white" />
        </div>

        <div className="relative max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Scale ton business en ligne
          </p>
          <h2 className="mt-4 text-[2rem] leading-[1.15] font-semibold tracking-tight">
            Le cockpit de pilotage de ton projet.
          </h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-white/75">
            Vision, tâches, questions, décisions, accès et roadmap — réunis au
            même endroit, en temps réel, pour toute l&apos;équipe.
          </p>
        </div>

        <p className="relative text-xs text-white/60">
          © {new Date().getFullYear()} Skalesy · Espace privé
        </p>
      </aside>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <LogoMark className="size-10" />
            <Logo className="h-6" />
          </div>

          <div className="mb-6 space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          {children}

          {footer && (
            <div className="mt-8 text-center text-xs text-muted-foreground">
              {footer}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
