import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ListChecks, MessagesSquare, OctagonAlert } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/app/empty-state";
import { getWorkspaces, getTasks, getQuestions, getBlockers } from "@/lib/queries";
import {
  PROVIDER_DOMAINS,
  DOMAIN_CHIP_CLASS,
  type ProviderDomain,
} from "@/lib/constants";

export const metadata: Metadata = { title: "Prestataires" };

export default async function ProvidersPage() {
  const [workspaces, tasks, questions, blockers] = await Promise.all([
    getWorkspaces(),
    getTasks(),
    getQuestions(),
    getBlockers(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prestataires"
        description="Un espace par expertise : vision, besoins, recommandations, tâches et blocages."
      />

      {workspaces.length === 0 ? (
        <EmptyState title="Aucun espace prestataire" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((w) => {
            const domain = w.domain as ProviderDomain;
            const d = PROVIDER_DOMAINS[domain];
            const Icon = d.icon;
            const tCount = tasks.filter((t) => t.domain === domain).length;
            const qCount = questions.filter(
              (q) => q.domain === domain && q.status === "open",
            ).length;
            const bCount = blockers.filter(
              (b) => b.domain === domain && b.status === "open",
            ).length;

            return (
              <Link
                key={w.id}
                href={`/prestataires/${domain}`}
                className="group flex flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={
                      "flex size-10 items-center justify-center rounded-xl " +
                      DOMAIN_CHIP_CLASS[domain]
                    }
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold leading-tight">{d.label}</h3>
                    <p className="text-xs text-muted-foreground">{d.description}</p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-opacity opacity-0 group-hover:opacity-100" />
                </div>

                {w.summary && (
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {w.summary}
                  </p>
                )}

                <div className="mt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Avancement</span>
                    <span className="font-medium tabular-nums">{w.progress}%</span>
                  </div>
                  <Progress value={w.progress} className="mt-1.5 h-1.5" />
                </div>

                <div className="mt-4 flex flex-wrap gap-3 border-t pt-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <ListChecks className="size-3.5" /> {tCount} tâches
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessagesSquare className="size-3.5" /> {qCount} questions
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <OctagonAlert className="size-3.5" /> {bCount} blocages
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
