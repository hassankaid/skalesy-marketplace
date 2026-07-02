"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Check,
  ArrowRight,
  RotateCcw,
  Compass,
  ListChecks,
  Briefcase,
  OctagonAlert,
  Settings,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";

type Audience = "all" | "skalesy" | "client" | "provider";
type Step = { id: string; label: string; audience: Audience; href?: string };
type Group = { title: string; icon: LucideIcon; steps: Step[] };

const GROUPS: Group[] = [
  {
    title: "1 · Découvrir",
    icon: Compass,
    steps: [
      { id: "d1", audience: "all", href: "/", label: "Ouvrir le Dashboard et repérer l'avancement global et les indicateurs (en cours, blocages, actions client…)." },
      { id: "d2", audience: "all", label: "Parcourir le menu de gauche pour voir les différentes sections du projet." },
      { id: "d3", audience: "all", href: "/prestataires", label: "Ouvrir un espace prestataire (ex. Développement) et lire sa vision, ses besoins et ses tâches." },
    ],
  },
  {
    title: "2 · Faire avancer une tâche",
    icon: ListChecks,
    steps: [
      { id: "t1", audience: "provider", href: "/taches", label: "Aller dans Tâches et filtrer par statut ou par domaine." },
      { id: "t2", audience: "provider", label: "Changer le statut d'une tâche (ex. « En cours » → « Validé ») et voir les compteurs se mettre à jour." },
      { id: "t3", audience: "all", label: "Basculer entre la vue Tableau et la vue Kanban." },
      { id: "t4", audience: "skalesy", label: "Créer une tâche avec le bouton « Nouvelle tâche »." },
    ],
  },
  {
    title: "3 · Les actions du client",
    icon: Briefcase,
    steps: [
      { id: "c1", audience: "client", href: "/client", label: "Ouvrir l'Espace client : tout ce qui est attendu du client est regroupé ici." },
      { id: "c2", audience: "client", href: "/questions", label: "Répondre à une question adressée au client." },
      { id: "c3", audience: "client", href: "/decisions", label: "Valider (ou écarter) une décision proposée." },
      { id: "c4", audience: "client", href: "/acces", label: "Faire passer un accès de « Nécessaire » à « Fourni » puis « Confirmé »." },
    ],
  },
  {
    title: "4 · Suivre & débloquer",
    icon: OctagonAlert,
    steps: [
      { id: "s1", audience: "provider", href: "/blocages", label: "Consulter les blocages et en marquer un comme « Résolu »." },
      { id: "s2", audience: "all", href: "/roadmap", label: "Suivre la roadmap du projet, étape par étape et par phase." },
    ],
  },
  {
    title: "5 · Piloter (Skalesy)",
    icon: Settings,
    steps: [
      { id: "a1", audience: "skalesy", href: "/admin", label: "Ouvrir Administration et ajouter ou retirer un membre autorisé." },
      { id: "a2", audience: "skalesy", href: "/equipe", label: "Consulter l'équipe et les rôles de chacun." },
    ],
  },
];

const ALL_IDS = GROUPS.flatMap((g) => g.steps.map((s) => s.id));
const TOTAL = ALL_IDS.length;
const STORAGE_KEY = "skalesy-guide-progress-v1";

const AUDIENCE: Record<Exclude<Audience, "all">, { label: string; className: string }> = {
  skalesy: { label: "Skalesy", className: "bg-violet-100 text-violet-700" },
  client: { label: "Client", className: "bg-sky-100 text-sky-700" },
  provider: { label: "Prestataire", className: "bg-slate-100 text-slate-600" },
};

export function TestChecklist() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(new Set((JSON.parse(raw) as string[]).filter((id) => ALL_IDS.includes(id))));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
      } catch {}
    }
  }, [done, loaded]);

  const count = useMemo(() => ALL_IDS.filter((id) => done.has(id)).length, [done]);
  const pct = Math.round((count / TOTAL) * 100);

  function toggle(id: string) {
    setDone((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Votre progression</p>
            <p className="text-xs text-muted-foreground">
              {count} / {TOTAL} étapes réalisées
            </p>
          </div>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setDone(new Set())}
            >
              <RotateCcw className="size-3.5" />
              Réinitialiser
            </Button>
          )}
        </div>
        <Progress value={pct} className="mt-3 h-2" />
        {count === TOTAL && (
          <p className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            <PartyPopper className="size-4" />
            Bravo, vous avez fait le tour de la plateforme !
          </p>
        )}
      </div>

      {/* Groups */}
      {GROUPS.map((group) => {
        const Icon = group.icon;
        return (
          <div key={group.title} className="overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-4" />
              </div>
              <h3 className="text-sm font-semibold">{group.title}</h3>
            </div>
            <ul className="divide-y">
              {group.steps.map((step) => {
                const checked = done.has(step.id);
                return (
                  <li key={step.id} className="flex items-start gap-3 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggle(step.id)}
                      aria-pressed={checked}
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                        checked
                          ? "border-brand bg-brand text-white"
                          : "border-input bg-background hover:border-brand/50",
                      )}
                    >
                      {checked && <Check className="size-3.5" strokeWidth={3} />}
                      <span className="sr-only">Marquer comme fait</span>
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm",
                          checked && "text-muted-foreground line-through",
                        )}
                      >
                        {step.label}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        {step.audience !== "all" && (
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.5 text-[0.7rem] font-medium",
                              AUDIENCE[step.audience].className,
                            )}
                          >
                            {AUDIENCE[step.audience].label}
                          </span>
                        )}
                        {step.href && (
                          <Link
                            href={step.href}
                            className="inline-flex items-center gap-0.5 text-xs font-medium text-brand hover:underline"
                          >
                            Ouvrir la page
                            <ArrowRight className="size-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
