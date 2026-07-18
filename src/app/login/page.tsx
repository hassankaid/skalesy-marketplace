import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";

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
    <AuthShell
      title="Connexion"
      description="Connecte-toi avec ton email et ton mot de passe."
    >
      <LoginForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
