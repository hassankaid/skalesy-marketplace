import type { Metadata } from "next";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Définir le mot de passe",
};

export default function SetPasswordPage() {
  return (
    <AuthShell
      title="Définir ton mot de passe"
      description="Choisis un mot de passe pour accéder au cockpit."
    >
      <SetPasswordForm />
    </AuthShell>
  );
}
