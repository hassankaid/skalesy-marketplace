import type { Metadata } from "next";
import { Map as MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { DomainBadge } from "@/components/app/badges";
import { ROADMAP_STATUS_LABELS, type RoadmapStatus } from "@/lib/constants";
import { getRoadmap } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import type { RoadmapRow } from "@/lib/database.types";

export const metadata: Metadata = { title: "Roadmap" };

const DOT: Record<RoadmapStatus, string> = {
  planned: "bg-slate-300",
  in_progress: "bg-blue-500",
  done: "bg-emerald-500",
};
const STATUS_CLASS: Record<RoadmapStatus, string> = {
  planned: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
};

export default async function RoadmapPage() {
  const items = await getRoadmap();

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
      />

      {groups.length === 0 ? (
        <EmptyState icon={MapIcon} title="Roadmap vide" />
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <div key={g.phase}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {g.phase}
              </h2>
              <ol className="relative space-y-3 border-l pl-6">
                {g.items.map((it) => {
                  const status = it.status as RoadmapStatus;
                  return (
                    <li key={it.id} className="relative">
                      <span
                        className={cn(
                          "absolute -left-[1.625rem] top-1.5 size-3 rounded-full ring-4 ring-background",
                          DOT[status],
                        )}
                      />
                      <div className="rounded-xl border bg-card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold">{it.title}</p>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                              STATUS_CLASS[status],
                            )}
                          >
                            {ROADMAP_STATUS_LABELS[status]}
                          </span>
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
