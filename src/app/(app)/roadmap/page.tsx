import type { Metadata } from "next";
import { Map as MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { DomainBadge } from "@/components/app/badges";
import { RoadmapStatusMenu } from "@/components/cockpit/roadmap-status-menu";
import { NewRoadmapDialog } from "@/components/cockpit/create-dialogs";
import { DeleteButton } from "@/components/cockpit/delete-button";
import {
  ROADMAP_STATUS_DOT_CLASS,
  type RoadmapStatus,
} from "@/lib/constants";
import { getRoadmap } from "@/lib/queries";
import { getAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { RoadmapRow } from "@/lib/database.types";

export const metadata: Metadata = { title: "Roadmap" };

export default async function RoadmapPage() {
  const [items, auth] = await Promise.all([getRoadmap(), getAuth()]);
  const isAdmin = auth?.profile?.role === "skalesy_admin";

  const groups: { phase: string; items: RoadmapRow[] }[] = [];
  for (const it of items) {
    const phase = it.phase ?? "Autres";
    let g = groups.find((x) => x.phase === phase);
    if (!g) {
      g = { phase, items: [] };
      groups.push(g);
    }
    g.items.push(it);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roadmap"
        description="Les grandes étapes du projet, par phase, du cadrage au lancement."
      >
        {isAdmin && <NewRoadmapDialog />}
      </PageHeader>

      {groups.length === 0 ? (
        <EmptyState
          icon={MapIcon}
          title="Roadmap vide"
          description="Ajoutez les grandes étapes du projet."
        />
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <div key={g.phase}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {g.phase}
              </h2>
              <ol className="relative space-y-3 pl-6 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-border">
                {g.items.map((it) => {
                  const status = it.status as RoadmapStatus;
                  return (
                    <li key={it.id} className="relative">
                      <span
                        className={cn(
                          "absolute -left-[1.625rem] top-1.5 size-3 rounded-full ring-4 ring-background",
                          ROADMAP_STATUS_DOT_CLASS[status],
                        )}
                      />
                      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold">{it.title}</p>
                          <div className="flex shrink-0 items-center gap-1">
                            <RoadmapStatusMenu
                              id={it.id}
                              status={status}
                              editable={isAdmin}
                            />
                            {isAdmin && (
                              <DeleteButton kind="roadmap" id={it.id} name={it.title} />
                            )}
                          </div>
                        </div>
                        {it.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {it.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <DomainBadge domain={it.domain} />
                          {(it.start_date || it.end_date) && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(it.start_date)}
                              {it.end_date ? ` → ${formatDate(it.end_date)}` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
