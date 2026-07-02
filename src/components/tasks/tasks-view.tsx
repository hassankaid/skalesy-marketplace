"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table2, CalendarClock } from "lucide-react";
import { StatusBadge, PriorityBadge, DomainBadge, OwnerBadge } from "@/components/app/badges";
import { EmptyState } from "@/components/app/empty-state";
import { TaskStatusMenu } from "@/components/cockpit/task-status-menu";
import { DeleteButton } from "@/components/cockpit/delete-button";
import {
  TASK_STATUS_ORDER,
  TASK_STATUS_LABELS,
  PROVIDER_DOMAIN_ORDER,
  PROVIDER_DOMAINS,
  type TaskStatus,
  type ProviderDomain,
  type UserRole,
} from "@/lib/constants";
import { formatDate, dueState, DUE_STATE_CLASS } from "@/lib/format";
import type { TaskRow, ProfileRow } from "@/lib/database.types";

function makeCanEdit(role: UserRole, domain: ProviderDomain | null) {
  return (t: TaskRow) => {
    if (role === "skalesy_admin") return true;
    if (role === "provider") return t.domain != null && t.domain === domain;
    if (role === "client") return t.owner_side === "client";
    return false;
  };
}

type StatusFilter = "all" | TaskStatus;
type DomainFilter = "all" | ProviderDomain;

export function TasksView({
  tasks,
  profiles,
  role,
  userDomain,
}: {
  tasks: TaskRow[];
  profiles: ProfileRow[];
  role: UserRole;
  userDomain: ProviderDomain | null;
}) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [domain, setDomain] = useState<DomainFilter>("all");
  const [view, setView] = useState<"table" | "board">("table");
  const canEdit = makeCanEdit(role, userDomain);

  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of profiles) m.set(p.id, p.full_name ?? p.email ?? "Membre");
    return m;
  }, [profiles]);

  const filtered = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (status === "all" || t.status === status) &&
          (domain === "all" || t.domain === domain),
      ),
    [tasks, status, domain],
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Pill active={status === "all"} onClick={() => setStatus("all")}>
            Toutes
            <span className="ml-1 text-muted-foreground">{tasks.length}</span>
          </Pill>
          {TASK_STATUS_ORDER.map((s) => {
            const n = tasks.filter((t) => t.status === s).length;
            return (
              <Pill key={s} active={status === s} onClick={() => setStatus(s)}>
                {TASK_STATUS_LABELS[s]}
                <span className="ml-1 text-muted-foreground">{n}</span>
              </Pill>
            );
          })}
          <div className="ml-auto inline-flex rounded-lg border bg-card p-0.5">
            <ViewButton
              active={view === "table"}
              onClick={() => setView("table")}
              icon={Table2}
              label="Tableau"
            />
            <ViewButton
              active={view === "board"}
              onClick={() => setView("board")}
              icon={LayoutGrid}
              label="Kanban"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Pill active={domain === "all"} onClick={() => setDomain("all")} subtle>
            Tous les domaines
          </Pill>
          {PROVIDER_DOMAIN_ORDER.map((d) => (
            <Pill
              key={d}
              active={domain === d}
              onClick={() => setDomain(d)}
              subtle
            >
              {PROVIDER_DOMAINS[d].short}
            </Pill>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Aucune tâche"
          description="Aucune tâche ne correspond à ces filtres."
        />
      ) : view === "table" ? (
        <TaskTable tasks={filtered} nameById={nameById} canEdit={canEdit} />
      ) : (
        <TaskBoard tasks={filtered} canEdit={canEdit} />
      )}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
  subtle,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  subtle?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors",
        active
          ? subtle
            ? "bg-foreground text-background"
            : "bg-primary text-primary-foreground"
          : "border bg-card text-foreground/70 hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function ViewButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Table2;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors",
        active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function TaskTable({
  tasks,
  nameById,
  canEdit,
}: {
  tasks: TaskRow[];
  nameById: Map<string, string>;
  canEdit: (t: TaskRow) => boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Tâche</th>
              <th className="px-4 py-2.5 font-medium">Domaine</th>
              <th className="px-4 py-2.5 font-medium">Responsable</th>
              <th className="px-4 py-2.5 font-medium">Priorité</th>
              <th className="px-4 py-2.5 font-medium">Échéance</th>
              <th className="px-4 py-2.5 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tasks.map((t) => {
              const du = dueState(t.due_date);
              return (
                <tr key={t.id} className="hover:bg-muted/30">
                  <td className="max-w-sm px-4 py-3">
                    <p className="font-medium">{t.title}</p>
                    {t.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {t.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <DomainBadge domain={t.domain} />
                  </td>
                  <td className="px-4 py-3">
                    <OwnerBadge owner={t.owner_side} />
                    {t.assignee_profile_id && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {nameById.get(t.assignee_profile_id)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className="px-4 py-3">
                    {t.due_date ? (
                      <span
                        className={cn(
                          "text-xs font-medium",
                          DUE_STATE_CLASS[du ?? "later"],
                        )}
                      >
                        {formatDate(t.due_date, "d MMM")}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <TaskStatusMenu
                        taskId={t.id}
                        status={t.status}
                        editable={canEdit(t)}
                      />
                      {canEdit(t) && (
                        <DeleteButton kind="task" id={t.id} name={t.title} />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TaskBoard({
  tasks,
  canEdit,
}: {
  tasks: TaskRow[];
  canEdit: (t: TaskRow) => boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {TASK_STATUS_ORDER.map((s) => {
        const items = tasks.filter((t) => t.status === s);
        return (
          <div key={s} className="flex flex-col rounded-xl border bg-muted/30">
            <div className="flex items-center justify-between px-3 py-2.5">
              <StatusBadge status={s} />
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                {items.length}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-2">
              {items.map((t) => {
                const du = dueState(t.due_date);
                return (
                  <div
                    key={t.id}
                    className="rounded-lg border bg-card p-3 shadow-sm"
                  >
                    <p className="text-sm font-medium leading-snug">{t.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <DomainBadge domain={t.domain} />
                      <OwnerBadge owner={t.owner_side} />
                    </div>
                    {t.due_date && (
                      <p
                        className={cn(
                          "mt-2 text-xs font-medium",
                          DUE_STATE_CLASS[du ?? "later"],
                        )}
                      >
                        Échéance {formatDate(t.due_date, "d MMM")}
                      </p>
                    )}
                    {canEdit(t) && (
                      <div className="mt-2 flex items-center justify-between border-t pt-2">
                        <TaskStatusMenu
                          taskId={t.id}
                          status={t.status}
                          editable
                        />
                        <DeleteButton kind="task" id={t.id} name={t.title} />
                      </div>
                    )}
                  </div>
                );
              })}
              {items.length === 0 && (
                <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                  Aucune
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
