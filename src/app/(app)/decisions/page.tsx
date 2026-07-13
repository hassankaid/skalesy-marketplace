import type { Metadata } from "next";
import { Gavel, CircleCheck } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { EmptyState } from "@/components/app/empty-state";
import { DomainBadge } from "@/components/app/badges";
import { DecisionActions } from "@/components/cockpit/decision-actions";
import { NewDecisionDialog } from "@/components/cockpit/create-dialogs";
import { DeleteButton } from "@/components/cockpit/delete-button";
import { Attachments, type AttachmentView } from "@/components/cockpit/attachments";
import { MentionText } from "@/components/cockpit/mentions";
import { DECISION_STATUS_LABELS, type DecisionStatus } from "@/lib/constants";
import { getDecisions, getAttachments } from "@/lib/queries";
import { getAuth } from "@/lib/auth";
import type { DecisionRow } from "@/lib/database.types";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Décisions" };

const STATUS_CLASS: Record<DecisionStatus, string> = {
  proposed: "bg-amber-100 text-amber-800",
  validated: "bg-emerald-100 text-emerald-700",
  rejected: "bg-slate-100 text-slate-600",
};

export default async function DecisionsPage() {
  const [decisions, auth, attachments] = await Promise.all([
    getDecisions(),
    getAuth(),
    getAttachments("decision"),
  ]);
  const role = auth?.profile?.role ?? "pending";
  const userId = auth?.user.id ?? null;
  const canDecide = role === "skalesy_admin" || role === "client";
  const canManage = role === "skalesy_admin";
  const canAttach = canDecide; // admin ou client peuvent joindre un document

  const validated = decisions.filter((d) => d.status === "validated");
  const others = decisions.filter((d) => d.status !== "validated");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Décisions"
        description="L'historique des décisions structurantes : ce qui est validé, proposé ou écarté."
      >
        {canManage && <NewDecisionDialog />}
      </PageHeader>

      {others.length > 0 && (
        <SectionCard
          title="En attente / proposées"
          description={`${others.length} décision(s)`}
          noPadding
        >
          <ul className="divide-y">
            {others.map((d) => (
              <li key={d.id} className="px-5 py-4">
                <Decision
                  d={d}
                  canDecide={canDecide}
                  canManage={canManage}
                  canAttach={canAttach}
                  currentUserId={userId}
                  attachments={attachments.get(d.id) ?? []}
                />
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <SectionCard
        title="Décisions validées"
        description={`${validated.length} décision(s)`}
        noPadding
      >
        {validated.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Gavel}
              title="Aucune décision validée"
              description="Ajoutez une décision et validez-la."
            />
          </div>
        ) : (
          <ul className="divide-y">
            {validated.map((d) => (
              <li key={d.id} className="px-5 py-4">
                <Decision
                  d={d}
                  canDecide={canDecide}
                  canManage={canManage}
                  canAttach={canAttach}
                  currentUserId={userId}
                  attachments={attachments.get(d.id) ?? []}
                />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

function Decision({
  d,
  canDecide,
  canManage,
  canAttach,
  currentUserId,
  attachments,
}: {
  d: DecisionRow;
  canDecide: boolean;
  canManage: boolean;
  canAttach: boolean;
  currentUserId: string | null;
  attachments: AttachmentView[];
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold">{d.title}</p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[d.status]}`}
        >
          {DECISION_STATUS_LABELS[d.status]}
        </span>
      </div>
      {d.context && (
        <p className="mt-1 text-xs text-muted-foreground">
          <MentionText text={d.context} />
        </p>
      )}
      {d.decision && (
        <p className="mt-2 flex items-start gap-1.5 text-sm">
          <CircleCheck className="mt-0.5 size-4 shrink-0 text-brand" />
          <span>
            <MentionText text={d.decision} />
          </span>
        </p>
      )}
      <Attachments
        entityType="decision"
        entityId={d.id}
        items={attachments}
        canAttach={canAttach}
        currentUserId={currentUserId}
        isAdmin={canManage}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <DomainBadge domain={d.domain} />
        {d.decided_at && (
          <span className="text-xs text-muted-foreground">
            Validée le {formatDate(d.decided_at)}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {canDecide && d.status === "proposed" && (
            <DecisionActions decisionId={d.id} />
          )}
          {canManage && <DeleteButton kind="decision" id={d.id} name={d.title} />}
        </div>
      </div>
    </>
  );
}
