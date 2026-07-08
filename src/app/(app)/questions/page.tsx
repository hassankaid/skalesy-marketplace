import type { Metadata } from "next";
import { MessagesSquare, CornerDownRight } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { EmptyState } from "@/components/app/empty-state";
import { DomainBadge, OwnerBadge, PriorityBadge } from "@/components/app/badges";
import { AnswerQuestionDialog } from "@/components/cockpit/answer-question-dialog";
import { NewQuestionDialog } from "@/components/cockpit/create-dialogs";
import { DeleteButton } from "@/components/cockpit/delete-button";
import { Attachments } from "@/components/cockpit/attachments";
import { QUESTION_STATUS_LABELS, type QuestionStatus } from "@/lib/constants";
import { getQuestions, getAttachments } from "@/lib/queries";
import { getAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { QuestionRow } from "@/lib/database.types";

export const metadata: Metadata = { title: "Questions" };

const STATUS_CLASS: Record<QuestionStatus, string> = {
  open: "bg-amber-100 text-amber-800",
  answered: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-100 text-slate-600",
};

export default async function QuestionsPage() {
  const [questions, auth, attachments] = await Promise.all([
    getQuestions(),
    getAuth(),
    getAttachments("question"),
  ]);
  const role = auth?.profile?.role ?? "pending";
  const userId = auth?.user.id ?? null;
  const isAdmin = role === "skalesy_admin";
  const userDomain = auth?.profile?.provider_domain ?? null;

  const canAnswer = (q: QuestionRow) =>
    role === "skalesy_admin" ||
    (role === "client" && q.directed_to === "client") ||
    (role === "provider" && q.domain != null && q.domain === userDomain);
  const canDelete = (q: QuestionRow) =>
    role === "skalesy_admin" ||
    (role === "provider" && q.domain != null && q.domain === userDomain);
  const canCreate = role === "skalesy_admin" || role === "provider";

  const open = questions.filter((q) => q.status === "open");
  const resolved = questions.filter((q) => q.status !== "open");

  const rowActions = (q: QuestionRow) => (
    <div className="ml-auto flex items-center gap-1">
      {canAnswer(q) && (
        <AnswerQuestionDialog
          questionId={q.id}
          question={q.body}
          defaultAnswer={q.answer}
          label={q.answer ? "Modifier" : "Répondre"}
        />
      )}
      {canDelete(q) && <DeleteButton kind="question" id={q.id} name={q.body} />}
    </div>
  );

  const attachmentsFor = (q: QuestionRow) => (
    <Attachments
      entityType="question"
      entityId={q.id}
      items={attachments.get(q.id) ?? []}
      canAttach={canAnswer(q)}
      currentUserId={userId}
      isAdmin={isAdmin}
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Questions ouvertes"
        description="Les questions en attente de réponse pour débloquer les décisions et l'avancement."
      >
        {canCreate && (
          <NewQuestionDialog
            defaultDomain={role === "provider" ? userDomain ?? undefined : undefined}
          />
        )}
      </PageHeader>

      <SectionCard
        title="En attente de réponse"
        description={`${open.length} question(s) ouverte(s)`}
        noPadding
      >
        {open.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={MessagesSquare}
              title="Aucune question ouverte"
              description="Ajoutez une question ou attendez les réponses."
            />
          </div>
        ) : (
          <ul className="divide-y">
            {open.map((q) => (
              <li key={q.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{q.body}</p>
                  <PriorityBadge priority={q.priority} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <DomainBadge domain={q.domain} />
                  <span className="text-xs text-muted-foreground">Pour</span>
                  <OwnerBadge owner={q.directed_to} />
                  {rowActions(q)}
                </div>
                {attachmentsFor(q)}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {resolved.length > 0 && (
        <SectionCard title="Répondues / clôturées" noPadding>
          <ul className="divide-y">
            {resolved.map((q) => (
              <li key={q.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{q.body}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[q.status]}`}
                  >
                    {QUESTION_STATUS_LABELS[q.status]}
                  </span>
                </div>
                {q.answer && (
                  <p className="mt-1.5 flex gap-1.5 text-sm text-muted-foreground">
                    <CornerDownRight className="mt-0.5 size-3.5 shrink-0" />
                    <span>{q.answer}</span>
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <DomainBadge domain={q.domain} />
                  {q.answered_at && (
                    <span className="text-xs text-muted-foreground">
                      Répondu le {formatDate(q.answered_at)}
                    </span>
                  )}
                  {rowActions(q)}
                </div>
                {attachmentsFor(q)}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
