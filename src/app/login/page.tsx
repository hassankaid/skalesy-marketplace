import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { LogoMark, Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Connexion",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const redirectTo =
    typeof sp.redirect === "string" && sp.redirect.startsWith("/")
      ? sp.redirect
      : "/";

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Subtle brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--color-brand), transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-24 size-[28rem] rounded-full opacity-10 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--color-brand-2), transparent)",
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
            <h1 className="text-xl font-semibold">Connexion</h1>
            <p className="text-sm text-muted-foreground">
              Connecte-toi avec ton email et ton mot de passe.
            </p>
          </div>
          <LoginForm redirectTo={redirectTo} />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Skalesy · Espace privé
        </p>
      </div>
    </main>
  );
}
