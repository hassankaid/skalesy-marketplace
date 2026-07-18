import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { signOut } from "@/app/actions/auth";

export function PendingAccess({ email }: { email: string | null }) {
  return (
    <AuthShell title="Accès en attente de validation">
      <div className="space-y-5">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/12 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
          <Clock className="size-3.5" />
          En attente de validation
        </span>
        <p className="text-sm text-muted-foreground">
          Ton compte{" "}
          <span className="font-medium text-foreground">{email}</span> est bien
          connecté, mais il n&apos;a pas encore de rôle attribué sur ce projet.
          Un administrateur Skalesy doit valider ton accès.
        </p>
        <form action={signOut}>
          <Button type="submit" variant="outline" className="w-full">
            Se déconnecter
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
