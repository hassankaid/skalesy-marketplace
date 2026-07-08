import type { Metadata } from "next";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { LogoMark, Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Définir le mot de passe",
};

export default function SetPasswordPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--color-brand), transparent)",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <LogoMark className="size-11" />
          <Logo className="text-2xl" />
          <p className="text-sm text-muted-foreground">
            Cockpit projet — pilotage de la marketplace
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 space-y-1">
            <h1 className="text-xl font-semibold">Définir ton mot de passe</h1>
            <p className="text-sm text-muted-foreground">
              Choisis un mot de passe pour accéder au cockpit.
            </p>
          </div>
          <SetPasswordForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Skalesy · Espace privé
        </p>
      </div>
    </main>
  );
}
