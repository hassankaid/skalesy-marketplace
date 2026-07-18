import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark, Logo } from "@/components/brand/logo";
import { signOut } from "@/app/actions/auth";

export function PendingAccess({ email }: { email: string | null }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex flex-col items-center gap-3">
          <LogoMark className="size-12" />
          <Logo className="h-7" />
        </div>
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Clock className="size-6" />
          </div>
          <h1 className="text-lg font-semibold">Accès en attente de validation</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ton compte{" "}
            <span className="font-medium text-foreground">{email}</span> est bien
            connecté, mais il n&apos;a pas encore de rôle attribué sur ce projet.
            Un administrateur Skalesy doit valider ton accès.
          </p>
          <form action={signOut} className="mt-6">
            <Button type="submit" variant="outline" className="w-full">
              Se déconnecter
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
