import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { TasksView } from "@/components/tasks/tasks-view";
import { NewTaskDialog } from "@/components/cockpit/new-task-dialog";
import { getTasks, getProfiles } from "@/lib/queries";
import { getAuth } from "@/lib/auth";

export const metadata: Metadata = { title: "Tâches" };

export default async function TasksPage() {
  const [tasks, profiles, auth] = await Promise.all([
    getTasks(),
    getProfiles(),
    getAuth(),
  ]);
  const role = auth?.profile?.role ?? "pending";
  const userDomain = auth?.profile?.provider_domain ?? null;
  const canCreate = role === "skalesy_admin" || role === "provider";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tâches"
        description="Toutes les tâches du projet, par prestataire et par statut."
      >
        {canCreate && (
          <NewTaskDialog
            defaultDomain={role === "provider" ? userDomain ?? undefined : undefined}
          />
        )}
      </PageHeader>
      <TasksView
        tasks={tasks}
        profiles={profiles}
        role={role}
        userDomain={userDomain}
      />
    </div>
  );
}
