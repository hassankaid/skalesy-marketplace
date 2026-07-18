import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Loader2,
  ListTodo,
  OctagonAlert,
  MessagesSquare,
  Briefcase,
  CircleCheck,
} from "lucide-react";
import {
  getProject,
  getTasks,
  getQuestions,
  getBlockers,
  getWorkspaces,
  getActivity,
} from "@/lib/queries";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/app/stat-card";
import { SectionCard } from "@/components/app/section-card";
import { EmptyState } from "@/components/app/empty-state";
import { StatusBadge, DomainBadge } from "@/components/app/badges";
import { ProgressRing } from "@/components/app/progress-ring";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProjectSettingsDialog } from "@/components/cockpit/project-settings-dialog";
import { getAuth } from "@/lib/auth";
import {
  PROVIDER_DOMAINS,
  DOMAIN_CHIP_CLASS,
  type ProviderDomain,
} from "@/lib/constants";
import { formatDate, dueState, DUE_STATE_CLASS } from "@/lib/format";

function initials(name: string | null) {
  const base = name?.trim();
  if (!base) return "?";
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  return (
    ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() ||
    base[0]!.toUpperCase()
  );
}

export default async function DashboardPage() {
  const [project, tasks, questions, blockers, workspaces, activity, auth] =
    await Promise.all([
      getProject(),
      getTasks(),
      getQuestions(),
      getBlockers(),
      getWorkspaces(),
      getActivity(8),
      getAuth(),
    ]);
  const isAdmin = auth?.profile?.role === "skalesy_admin";

  if (!project) {
    return (
      <EmptyState
        icon={Activity}
        title="Aucun projet"
        description="Le projet n'a pas encore été initialisé."
      />
    );
  }

  const objectives = Array.isArray(project.objectives)
    ? (project.objectives as string[])
    : [];

  const count = (s: string) => tasks.filter((t) => t.status === s).length;
  const openQuestions = questions.filter((q) => q.status === "open");
  const openBlockers = blockers.filter((b) => b.status === "open");
  const clientActions = tasks.filter(
    (t) => t.owner_side === "client" && t.status !== "done",
  );
  const blockedOrWaiting = tasks.filter(
    (t) => t.status === "blocked" || t.status === "waiting",
  );

  return (
    <div className="space-y-6">
      {/* Project header */}
      <section className="shadow-card relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 sm:p-7">
        <div
          aria-hidden
          className="gradient-brand pointer-events-none absolute -top-24 -right-20 size-64 rounded-full opacity-[0.07] blur-2xl"
        />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Projet actif
            </span>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {project.description}
              </p>
            )}
            {objectives.length > 0 && (
              <ul className="flex flex-wrap gap-2 pt-1">
                {objectives.map((o, i) => (
                  <li
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs text-foreground/80"
                  >
                    <CircleCheck className="size-3.5 text-brand dark:text-fuchsia-300" />
                    {o}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex w-full shrink-0 flex-col items-center gap-5 rounded-2xl border border-border/70 bg-muted/25 p-5 lg:w-64">
            <ProgressRing value={project.progress} size={132} />
            {(project.start_date || project.target_date) && (
              <dl className="w-full space-y-1.5 text-xs">
                {project.start_date && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Démarrage</dt>
                    <dd className="font-medium tabular-nums">
                      {formatDate(project.start_date)}
                    </dd>
                  </div>
                )}
                {project.target_date && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Échéance cible</dt>
                    <dd className="font-medium tabular-nums">
                      {formatDate(project.target_date)}
                    </dd>
                  </div>
                )}
              </dl>
            )}
            {isAdmin && (
              <div className="w-full">
                <ProjectSettingsDialog
                  project={{
                    name: project.name,
                    client_name: project.client_name,
                    description: project.description,
                    objectives,
                    start_date: project.start_date,
                    target_date: project.target_date,
                    progress: project.progress,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="En cours"
          value={count("in_progress")}
          icon={Loader2}
          tone="brand"
          href="/taches"
        />
        <StatCard
          label="À traiter"
          value={count("todo") + count("waiting")}
          icon={ListTodo}
          href="/taches"
        />
        <StatCard
          label="Blocages"
          value={openBlockers.length}
          icon={OctagonAlert}
          tone="danger"
          href="/blocages"
        />
        <StatCard
          label="Questions ouvertes"
          value={openQuestions.length}
          icon={MessagesSquare}
          tone="warning"
          href="/questions"
        />
        <StatCard
          label="Actions client"
          value={clientActions.length}
          icon={Briefcase}
          href="/client"
        />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard
            title="À débloquer en priorité"
            description="Blocages ouverts et tâches en attente"
            noPadding
            action={
              <Link
                href="/blocages"
                className="text-xs font-medium text-brand hover:underline"
              >
                Tout voir
              </Link>
            }
          >
            {openBlockers.length === 0 && blockedOrWaiting.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={CheckCircle2}
                  title="Rien à débloquer"
                  description="Aucun blocage ni tâche en attente pour le moment."
                />
              </div>
            ) : (
              <ul className="divide-y">
                {openBlockers.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center gap-3 px-5 py-3 text-sm"
                  >
                    <OctagonAlert className="size-4 shrink-0 text-red-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{b.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        Blocage · {b.description ?? "—"}
                      </p>
                    </div>
                    <DomainBadge domain={b.domain} />
                  </li>
                ))}
                {blockedOrWaiting.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 px-5 py-3 text-sm"
                  >
                    <StatusBadge status={t.status} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{t.title}</p>
                      {t.due_date && (
                        <p
                          className={`text-xs ${
                            DUE_STATE_CLASS[dueState(t.due_date) ?? "later"]
                          }`}
                        >
                          Échéance {formatDate(t.due_date)}
                        </p>
                      )}
                    </div>
                    <DomainBadge domain={t.domain} />
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="Actions attendues côté client"
            description="Ce que le client doit réaliser pour avancer"
            noPadding
            action={
              <Link
                href="/client"
                className="text-xs font-medium text-brand hover:underline"
              >
                Espace client
              </Link>
            }
          >
            {clientActions.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={CheckCircle2}
                  title="Aucune action en attente"
                  description="Le client est à jour."
                />
              </div>
            ) : (
              <ul className="divide-y">
                {clientActions.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 px-5 py-3 text-sm"
                  >
                    <StatusBadge status={t.status} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{t.title}</p>
                      {t.due_date && (
                        <p
                          className={`text-xs ${
                            DUE_STATE_CLASS[dueState(t.due_date) ?? "later"]
                          }`}
                        >
                          Échéance {formatDate(t.due_date)}
                        </p>
                      )}
                    </div>
                    <DomainBadge domain={t.domain} />
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Avancement par prestataire" noPadding>
            <ul className="divide-y">
              {workspaces.map((w) => {
                const d = PROVIDER_DOMAINS[w.domain as ProviderDomain];
                const Icon = d.icon;
                return (
                  <li key={w.id}>
                    <Link
                      href={`/prestataires/${w.domain}`}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
                    >
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${DOMAIN_CHIP_CLASS[w.domain as ProviderDomain]}`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{d.short}</p>
                        <Progress value={w.progress} className="mt-1.5 h-1.5" />
                      </div>
                      <span className="text-xs font-medium tabular-nums text-muted-foreground">
                        {w.progress}%
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          <SectionCard title="Activité récente" noPadding>
            {activity.length === 0 ? (
              <div className="p-5">
                <EmptyState icon={Activity} title="Aucune activité" />
              </div>
            ) : (
              <ul className="p-5">
                {activity.map((a, i) => {
                  const last = i === activity.length - 1;
                  return (
                    <li key={a.id} className="flex gap-3.5">
                      <div className="flex flex-col items-center">
                        {a.actor_name ? (
                          <Avatar className="size-8 ring-4 ring-card">
                            <AvatarFallback className="text-[0.62rem]">
                              {initials(a.actor_name)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground ring-4 ring-card">
                            <Activity className="size-3.5" />
                          </span>
                        )}
                        {!last && (
                          <span className="mt-1 w-px flex-1 bg-border" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pb-5">
                        <p className="text-sm leading-snug">{a.summary}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {a.actor_name ?? "Système"} ·{" "}
                          {formatDate(a.created_at, "d MMM, HH:mm")}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
