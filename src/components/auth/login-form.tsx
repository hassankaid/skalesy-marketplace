"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, Loader2, Eye, EyeOff, MailCheck } from "lucide-react";

type Mode = "signin" | "signup" | "forgot";
type Sent = null | "signup" | "reset";

export function LoginForm({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<Sent>(null);

  const next = redirectTo.startsWith("/") ? redirectTo : "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();

    // --- Forgot password: only the email is needed ---
    if (mode === "forgot") {
      if (!email) return;
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/definir-mot-de-passe`,
      });
      setLoading(false);
      if (error) {
        toast.error("Envoi impossible", { description: error.message });
        return;
      }
      setSent("reset");
      return;
    }

    if (!email || !password) return;
    setLoading(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (error) {
        toast.error("Connexion impossible", {
          description:
            error.message === "Invalid login credentials"
              ? "Email ou mot de passe incorrect."
              : error.message,
        });
        return;
      }
      router.push(next);
      router.refresh();
      return;
    }

    // signup
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      toast.error("Création impossible", { description: error.message });
      return;
    }
    if (data.session) {
      // Email confirmation disabled → logged in immediately
      router.push(next);
      router.refresh();
    } else {
      // Email confirmation enabled in Supabase → ask to confirm
      setSent("signup");
    }
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <MailCheck className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            {sent === "signup" ? "Confirme ton email" : "Vérifie ta boîte mail"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {sent === "signup" ? (
              <>
                Un email de confirmation a été envoyé à{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Clique sur le lien pour activer ton compte, puis connecte-toi.
              </>
            ) : (
              <>
                Si un compte existe pour{" "}
                <span className="font-medium text-foreground">{email}</span>, un
                lien de réinitialisation vient d’être envoyé. Clique dessus pour
                choisir un nouveau mot de passe.
              </>
            )}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => {
            setSent(null);
            setMode("signin");
          }}
        >
          Retour à la connexion
        </Button>
      </div>
    );
  }

  const isForgot = mode === "forgot";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isForgot && (
        <p className="text-sm text-muted-foreground">
          Saisis ton adresse email : nous t’enverrons un lien pour réinitialiser
          ton mot de passe.
        </p>
      )}

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

      {!isForgot && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            {mode === "signin" && (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-xs font-medium text-muted-foreground hover:text-brand hover:underline"
              >
                Mot de passe oublié ?
              </button>
            )}
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={showPassword ? "Masquer" : "Afficher"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {mode === "signup" && (
            <p className="text-xs text-muted-foreground">Au moins 6 caractères.</p>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="h-11 w-full"
        disabled={loading || !email || (!isForgot && !password)}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            {mode === "signin"
              ? "Se connecter"
              : mode === "signup"
                ? "Créer mon compte"
                : "Envoyer le lien"}
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        {mode === "signin" && (
          <>
            Pas encore de compte ?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="font-medium text-brand hover:underline"
            >
              Créer un compte
            </button>
          </>
        )}
        {mode === "signup" && (
          <>
            Déjà un compte ?{" "}
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="font-medium text-brand hover:underline"
            >
              Se connecter
            </button>
          </>
        )}
        {mode === "forgot" && (
          <button
            type="button"
            onClick={() => setMode("signin")}
            className="font-medium text-brand hover:underline"
          >
            Retour à la connexion
          </button>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Accès réservé aux membres du projet.
      </p>
    </form>
  );
}
