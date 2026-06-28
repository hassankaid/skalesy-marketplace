"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, Loader2, Eye, EyeOff, MailCheck } from "lucide-react";

type Mode = "signin" | "signup";

export function LoginForm({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const next = redirectTo.startsWith("/") ? redirectTo : "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const supabase = createClient();

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
      setEmailSent(true);
    }
  }

  if (emailSent) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <MailCheck className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Confirme ton email</h2>
          <p className="text-sm text-muted-foreground">
            Un email de confirmation a été envoyé à{" "}
            <span className="font-medium text-foreground">{email}</span>. Clique
            sur le lien pour activer ton compte, puis connecte-toi.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => {
            setEmailSent(false);
            setMode("signin");
          }}
        >
          Retour à la connexion
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

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
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
          <p className="text-xs text-muted-foreground">
            Au moins 6 caractères.
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="h-11 w-full"
        disabled={loading || !email || !password}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            {mode === "signin" ? "Se connecter" : "Créer mon compte"}
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        {mode === "signin" ? (
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
        ) : (
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
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Accès réservé aux membres du projet.
      </p>
    </form>
  );
}
