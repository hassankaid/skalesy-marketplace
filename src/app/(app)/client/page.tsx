import type { Metadata } from "next";
import {
  ListChecks,
  MessagesSquare,
  KeyRound,
  Gavel,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { EmptyState } from "@/components/app/empty-state";
import { DomainBadge } from "@/components/app/badges";
import { TaskStatusMenu } from "@/components/cockpit/task-status-menu";
import { AnswerQuestionDialog } from "@/components/cockpit/answer-question-dialog";
import { AccessStatusMenu } from "@/components/cockpit/access-status-menu";
import { DecisionActions } from "@/components/cockpit/decision-actions";
import { MentionText } from "@/components/cockpit/mentions";
import { getTasks, getQuestions, getAccesses, getDecisions } from "@/lib/queries";
import { getAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Espace client" };

export default async function ClientPage() {
  const [tasks, questions, accesses, decisions, auth] = await Promise.all([
    getTasks(),
    getQuestions(),
    getAccesses(),
    getDecisions(),
    getAuth(),
  ]);

  const role = auth?.profile?.role ?? "pending";
  const canAct = role === "skalesy_admin" || role === "client";

  const actions = tasks.filter(
    (t) => t.owner_side === "client" && t.status !== "done",
  );
  const clientQuestions = questions.filter(
    (q) => q.directed_to === "client" && q.status === "open",
  );
  const toProvide = accesses.filter(
    (a) => a.provided_by === "client" && a.status !== "confirmed",
  );
  const toValidate = decisions.filter((d) => d.status === "proposed");

  const total =
    actions.length +
    clientQuestions.length +
    toProvide.length +
    toValidate.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Espace client"
        description="Tout ce qui est attendu de votre côté pour faire avancer le projet, au même endroit."
      />

      {total === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Vous êtes à jour"
          description="Aucune action n'est attendue de votre côté pour le moment."
        />
      ) : (
        <div className="space-y-6">
          <SectionCard
            title="Vos actions à réaliser"
            description={`${actions.length} action(s)`}
            noPadding
          >
            {actions.length === 0 ? (
              <div className="p-5">
                <EmptyState icon={ListChecks} title="Aucune action en attente" />
              </div>
            ) : (
              <ul className="divide-y">
                {actions.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{t.title}</p>
                      {t.description && (
                        <p className="text-xs text-muted-foreground">
                          {t.description}
                        </p>
                      )}
                      {t.due_date && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Échéance {formatDate(t.due_date)}
                        </p>
                      )}
                    </div>
                    <DomainBadge domain={t.domain} />
                    <TaskStatusMenu
                      taskId={t.id}
                      status={t.status}
                      editable={canAct}
                    />
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard
              title="Questions en attente de réponse"
              description={`${clientQuestions.length} question(s)`}
              noPadding
            >
              {clientQuestions.length === 0 ? (
                <div className="p-5">
                  <EmptyState icon={MessagesSquare} title="Aucune question" />
                </div>
              ) : (
                <ul className="divide-y">
                  {clientQuestions.map((q) => (
                    <li key={q.id} className="px-5 py-3">
                      <p className="text-sm font-medium">
                        <MentionText text={q.body} />
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <DomainBadge domain={q.domain} />
                        {canAct && (
                          <div className="ml-auto">
                            <AnswerQuestionDialog
                              questionId={q.id}
                              question={q.body}
                            />
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard
              title="Accès à fournir"
              description={`${toProvide.length} accès`}
              noPadding
            >
              {toProvide.length === 0 ? (
                <div className="p-5">
                  <EmptyState icon={KeyRound} title="Aucun accès à fournir" />
                </div>
              ) : (
                <ul className="divide-y">
                  {toProvide.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{a.name}</p>
                        {a.description && (
                          <p className="text-xs text-muted-foreground">
                            {a.description}
                          </p>
                        )}
                      </div>
                      <AccessStatusMenu
                        accessId={a.id}
                        status={a.status}
                        editable={canAct}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          <SectionCard
            title="Décisions à valider"
            description={`${toValidate.length} décision(s)`}
            noPadding
          >
            {toValidate.length === 0 ? (
              <div className="p-5">
                <EmptyState icon={Gavel} title="Aucune décision en attente" />
              </div>
            ) : (
              <ul className="divide-y">
                {toValidate.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-start justify-between gap-3 px-5 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{d.title}</p>
                      {d.context && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          <MentionText text={d.context} />
                        </p>
                      )}
                    </div>
                    {canAct && <DecisionActions decisionId={d.id} />}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
