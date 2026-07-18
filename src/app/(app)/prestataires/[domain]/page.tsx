import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  HandHelping,
  Lightbulb,
  ListChecks,
  MessagesSquare,
  OctagonAlert,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SectionCard } from "@/components/app/section-card";
import { EmptyState } from "@/components/app/empty-state";
import {
  StatusBadge,
  PriorityBadge,
  OwnerBadge,
} from "@/components/app/badges";
import {
  QUESTION_STATUS_LABELS,
  BLOCKER_STATUS_LABELS,
  BLOCKER_STATUS_BADGE_CLASS,
  DOMAIN_CHIP_CLASS,
  PROVIDER_DOMAINS,
  PROVIDER_DOMAIN_ORDER,
  type ProviderDomain,
} from "@/lib/constants";
import { getWorkspace, getTasks, getQuestions, getBlockers } from "@/lib/queries";
import { getAuth } from "@/lib/auth";
import { WorkspaceEditDialog } from "@/components/cockpit/workspace-edit-dialog";
import { MentionText } from "@/components/cockpit/mentions";
import { formatDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const d = PROVIDER_DOMAINS[domain as ProviderDomain];
  return { title: d ? d.label : "Prestataire" };
}

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain: raw } = await params;
  if (!PROVIDER_DOMAIN_ORDER.includes(raw as ProviderDomain)) notFound();
  const domain = raw as ProviderDomain;
  const meta = PROVIDER_DOMAINS[domain];
  const Icon = meta.icon;

  const [workspace, allTasks, allQuestions, allBlockers, auth] = await Promise.all([
    getWorkspace(domain),
    getTasks(),
    getQuestions(),
    getBlockers(),
    getAuth(),
  ]);
  const role = auth?.profile?.role ?? "pending";
  const canEdit =
    role === "skalesy_admin" ||
    (role === "provider" && auth?.profile?.provider_domain === domain);

  const tasks = allTasks.filter((t) => t.domain === domain);
  const questions = allQuestions.filter((q) => q.domain === domain);
  const blockers = allBlockers.filter((b) => b.domain === domain);

  return (
    <div className="space-y-6">
      <Link
        href="/prestataires"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Prestataires
      </Link>

      {/* Header */}
      <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={
                "flex size-12 items-center justify-center rounded-xl " +
                DOMAIN_CHIP_CLASS[domain]
              }
            >
              <Icon className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {meta.label}
              </h1>
              <p className="text-sm text-muted-foreground">{meta.description}</p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-52">
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Avancement</span>
                <span className="font-medium tabular-nums">
                  {workspace?.progress ?? 0}%
                </span>
              </div>
              <Progress value={workspace?.progress ?? 0} className="mt-1.5 h-2" />
            </div>
            {canEdit && workspace && (
              <WorkspaceEditDialog
                workspaceId={workspace.id}
                summary={workspace.summary}
                needs={workspace.needs}
                recommendations={workspace.recommendations}
                progress={workspace.progress}
              />
            )}
          </div>
        </div>
      </section>

      {/* Vision / Needs / Recommendations */}
      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard icon={Eye} title="Vision" text={workspace?.summary} />
        <InfoCard icon={HandHelping} title="Besoins" text={workspace?.needs} />
        <InfoCard
          icon={Lightbulb}
          title="Recommandations"
          text={workspace?.recommendations}
        />
      </div>

      {/* Tasks */}
      <SectionCard
        title="Tâches"
        description={`${tasks.length} tâche(s) sur ce périmètre`}
        noPadding
      >
        {tasks.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={ListChecks} title="Aucune tâche" />
          </div>
        ) : (
          <ul className="divide-y">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  {t.due_date && (
                    <p className="text-xs text-muted-foreground">
                      Échéance {formatDate(t.due_date)}
                    </p>
                  )}
                </div>
                <OwnerBadge owner={t.owner_side} />
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Questions */}
        <SectionCard title="Questions" noPadding>
          {questions.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={MessagesSquare} title="Aucune question" />
            </div>
          ) : (
            <ul className="divide-y">
              {questions.map((q) => (
                <li key={q.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">
                      <MentionText text={q.body} />
                    </p>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {QUESTION_STATUS_LABELS[q.status]}
                    </span>
                  </div>
                  {q.answer && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      → <MentionText text={q.answer} />
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Blockers */}
        <SectionCard title="Blocages" noPadding>
          {blockers.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={OctagonAlert} title="Aucun blocage" />
            </div>
          ) : (
            <ul className="divide-y">
              {blockers.map((b) => (
                <li key={b.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">{b.title}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${BLOCKER_STATUS_BADGE_CLASS[b.status]}`}
                    >
                      {BLOCKER_STATUS_LABELS[b.status]}
                    </span>
                  </div>
                  {b.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      <MentionText text={b.description} />
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Eye;
  title: string;
  text: string | null | undefined;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="size-4 text-brand" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {text || "À compléter."}
      </p>
    </div>
  );
}
