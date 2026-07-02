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
  CircleCheckBig,
  PartyPopper,
  Building2,
  Code2,
  UserSquare,
  Eye,
  type LucideIcon,
} from "lucide-react";

type Role = "skalesy" | "provider" | "client" | "all";
type Step = { id: string; label: string; expected?: string; href?: string };
type Group = {
  role: Role;
  who: string;
  account?: string;
  icon: LucideIcon;
  steps: Step[];
};

const ROLE_STYLE: Record<Role, string> = {
  skalesy: "bg-violet-100 text-violet-700",
  provider: "bg-slate-100 text-slate-600",
  client: "bg-sky-100 text-sky-700",
  all: "bg-muted text-muted-foreground",
};
const ROLE_LABEL: Record<Role, string> = {
  skalesy: "Skalesy",
  provider: "Prestataire",
  client: "Client",
  all: "Tous",
};

const GROUPS: Group[] = [
  {
    role: "skalesy",
    who: "Admin Skalesy",
    account: "contact@hassankaid.com",
    icon: Building2,
    steps: [
      {
        id: "a1",
        href: "/",
        label:
          "Sur le Dashboard, clique « Configurer le projet » : saisis le nom, la vision, quelques objectifs, les dates et l'avancement, puis Enregistre.",
        expected:
          "Le Dashboard affiche ta vision, tes objectifs et la barre d'avancement.",
      },
      {
        id: "a2",
        href: "/prestataires",
        label:
          "Dans Prestataires, ouvre « Développement » puis « Modifier l'espace » et renseigne vision, besoins et recommandations.",
        expected: "Les textes apparaissent dans l'espace du prestataire.",
      },
      {
        id: "a3",
        href: "/taches",
        label:
          "Dans Tâches, clique « Nouvelle tâche » : titre, domaine « Développement », responsable « Prestataire », puis Créer.",
        expected: "La tâche apparaît et le compteur « À traiter » augmente.",
      },
      {
        id: "a4",
        href: "/questions",
        label:
          "Dans Questions, clique « Nouvelle question » adressée au « Client », puis Créer.",
        expected: "La question apparaît dans « En attente de réponse ».",
      },
      {
        id: "a5",
        href: "/decisions",
        label:
          "Ajoute une décision (Décisions), un accès à fournir (Accès) et une étape (Roadmap).",
        expected: "Chaque élément apparaît dans sa section.",
      },
      {
        id: "a6",
        href: "/admin",
        label:
          "Ouvre Administration : ajoute (ou retire) un membre autorisé par email.",
        expected: "La liste des membres se met à jour.",
      },
    ],
  },
  {
    role: "provider",
    who: "Prestataire — Développement",
    account: "nadir@neteo.digital",
    icon: Code2,
    steps: [
      {
        id: "b1",
        href: "/taches",
        label:
          "Ouvre Tâches : tu vois la tâche créée par l'admin. Change son statut en « En cours ».",
        expected:
          "Le statut est mis à jour pour tout le monde et les compteurs bougent.",
      },
      {
        id: "b2",
        href: "/prestataires/dev",
        label:
          "Dans ton espace « Développement », clique « Modifier l'espace » et mets à jour tes besoins.",
        expected:
          "Seul ton domaine est modifiable — les autres espaces sont en lecture seule.",
      },
      {
        id: "b3",
        href: "/blocages",
        label: "Dans Blocages, clique « Signaler un blocage ».",
        expected: "Le blocage apparaît dans « Blocages ouverts ».",
      },
      {
        id: "b4",
        label: "Regarde le menu de gauche.",
        expected: "« Administration » n'apparaît pas (réservé à Skalesy).",
      },
    ],
  },
  {
    role: "client",
    who: "Client",
    account: "compte à créer (ou prévisualisable en admin)",
    icon: UserSquare,
    steps: [
      {
        id: "c1",
        href: "/client",
        label: "Ouvre l'Espace client : tout ce qui t'est demandé est regroupé ici.",
        expected:
          "Tu vois tes actions, les questions, les accès et les décisions te concernant.",
      },
      {
        id: "c2",
        href: "/questions",
        label: "Réponds à la question posée par l'admin.",
        expected: "La question passe en « Répondue ».",
      },
      {
        id: "c3",
        href: "/decisions",
        label: "Valide une décision proposée.",
        expected: "La décision passe en « Validée ».",
      },
      {
        id: "c4",
        href: "/acces",
        label: "Fais passer un accès de « Nécessaire » à « Fourni ».",
        expected: "Le statut de l'accès change immédiatement.",
      },
    ],
  },
  {
    role: "all",
    who: "Vérifications transverses",
    icon: Eye,
    steps: [
      {
        id: "d1",
        href: "/",
        label: "Reviens au Dashboard après quelques actions.",
        expected:
          "L'« Activité récente » et les indicateurs reflètent ce qui vient d'être fait.",
      },
      {
        id: "d2",
        label: "Constate le périmètre de chacun.",
        expected:
          "Client = ses actions · Prestataire = son domaine · Skalesy = tout.",
      },
    ],
  },
];

const ALL_IDS = GROUPS.flatMap((g) => g.steps.map((s) => s.id));
const TOTAL = ALL_IDS.length;
const STORAGE_KEY = "skalesy-guide-progress-v2";

export function TestChecklist() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw)
        setDone(
          new Set((JSON.parse(raw) as string[]).filter((id) => ALL_IDS.includes(id))),
        );
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
            Parcours de test terminé — la plateforme est prise en main !
          </p>
        )}
      </div>

      {GROUPS.map((group) => {
        const Icon = group.icon;
        return (
          <div key={group.who} className="overflow-hidden rounded-xl border bg-card">
            <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-4" />
              </div>
              <h3 className="text-sm font-semibold">{group.who}</h3>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[0.7rem] font-medium",
                  ROLE_STYLE[group.role],
                )}
              >
                {ROLE_LABEL[group.role]}
              </span>
              {group.account && (
                <span className="ml-auto rounded-md bg-muted px-2 py-0.5 font-mono text-[0.7rem] text-muted-foreground">
                  {group.account}
                </span>
              )}
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
                      <p className={cn("text-sm", checked && "text-muted-foreground line-through")}>
                        {step.label}
                      </p>
                      {step.expected && (
                        <p className="mt-1 flex items-start gap-1.5 text-xs text-emerald-700">
                          <CircleCheckBig className="mt-0.5 size-3.5 shrink-0" />
                          <span>
                            <span className="font-medium">Résultat attendu :</span>{" "}
                            {step.expected}
                          </span>
                        </p>
                      )}
                      {step.href && (
                        <Link
                          href={step.href}
                          className="mt-1 inline-flex items-center gap-0.5 text-xs font-medium text-brand hover:underline"
                        >
                          Ouvrir la page
                          <ArrowRight className="size-3" />
                        </Link>
                      )}
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
