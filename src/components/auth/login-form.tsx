"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, Loader2, MailCheck, RotateCcw } from "lucide-react";

export function LoginForm({ redirectTo = "/" }: { redirectTo?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    const supabase = createClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const next = redirectTo.startsWith("/") ? redirectTo : "/";

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    setLoading(false);
    if (error) {
      toast.error("Impossible d'envoyer le lien", {
        description: error.message,
      });
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <MailCheck className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Vérifie ta boîte mail</h2>
          <p className="text-sm text-muted-foreground">
            Un lien de connexion a été envoyé à{" "}
            <span className="font-medium text-foreground">{email}</span>.
            Clique dessus pour accéder au cockpit.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setSent(false)}
        >
          <RotateCcw className="size-3.5" />
          Utiliser une autre adresse
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Adresse email</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="prenom@entreprise.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="h-11"
        />
      </div>
      <Button type="submit" className="h-11 w-full" disabled={loading || !email}>
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            Recevoir le lien de connexion
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Accès réservé aux membres du projet. Pas de mot de passe : on t&apos;envoie
        un lien sécurisé par email.
      </p>
    </form>
  );
}
