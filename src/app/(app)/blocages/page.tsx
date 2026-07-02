import type { Metadata } from "next";
import { OctagonAlert, CheckCircle2, CornerDownRight } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { EmptyState } from "@/components/app/empty-state";
import { DomainBadge, PriorityBadge } from "@/components/app/badges";
import { BlockerActions } from "@/components/cockpit/blocker-actions";
import { NewBlockerDialog } from "@/components/cockpit/create-dialogs";
import { DeleteButton } from "@/components/cockpit/delete-button";
import { getBlockers } from "@/lib/queries";
import { getAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { BlockerRow } from "@/lib/database.types";

export const metadata: Metadata = { title: "Blocages" };

export default async function BlockersPage() {
  const [blockers, auth] = await Promise.all([getBlockers(), getAuth()]);
  const role = auth?.profile?.role ?? "pending";
  const userDomain = auth?.profile?.provider_domain ?? null;
  const canEdit = (b: BlockerRow) =>
    role === "skalesy_admin" ||
    (role === "provider" && b.domain != null && b.domain === userDomain);
  const canCreate = role === "skalesy_admin" || role === "provider";

  const open = blockers.filter((b) => b.status === "open");
  const resolved = blockers.filter((b) => b.status === "resolved");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blocages"
        description="Les points bloquants qui empêchent l'avancement, et leur résolution."
      >
        {canCreate && (
          <NewBlockerDialog
            defaultDomain={role === "provider" ? userDomain ?? undefined : undefined}
          />
        )}
      </PageHeader>

      <SectionCard
        title="Blocages ouverts"
        description={`${open.length} blocage(s)`}
        noPadding
      >
        {open.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={CheckCircle2}
              title="Aucun blocage"
              description="Rien ne bloque le projet actuellement."
            />
          </div>
        ) : (
          <ul className="divide-y">
            {open.map((b) => (
              <li key={b.id} className="flex gap-3 px-5 py-4">
                <OctagonAlert className="mt-0.5 size-4 shrink-0 text-red-500" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">{b.title}</p>
                    <PriorityBadge priority={b.severity} />
                  </div>
                  {b.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {b.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <DomainBadge domain={b.domain} />
                    <span className="text-xs text-muted-foreground">
                      Signalé le {formatDate(b.created_at)}
                    </span>
                    {canEdit(b) && (
                      <div className="ml-auto flex items-center gap-1">
                        <BlockerActions blockerId={b.id} status="open" />
                        <DeleteButton kind="blocker" id={b.id} name={b.title} />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {resolved.length > 0 && (
        <SectionCard title="Blocages résolus" noPadding>
          <ul className="divide-y">
            {resolved.map((b) => (
              <li key={b.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{b.title}</p>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Résolu
                  </span>
                </div>
                {b.resolution && (
                  <p className="mt-1.5 flex gap-1.5 text-sm text-muted-foreground">
                    <CornerDownRight className="mt-0.5 size-3.5 shrink-0" />
                    <span>{b.resolution}</span>
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <DomainBadge domain={b.domain} />
                  {canEdit(b) && (
                    <div className="ml-auto flex items-center gap-1">
                      <BlockerActions blockerId={b.id} status="resolved" />
                      <DeleteButton kind="blocker" id={b.id} name={b.title} />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
