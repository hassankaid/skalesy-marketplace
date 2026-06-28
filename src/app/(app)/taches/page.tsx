import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { TasksView } from "@/components/tasks/tasks-view";
import { getTasks, getProfiles } from "@/lib/queries";

export const metadata: Metadata = { title: "Tâches" };

export default async function TasksPage() {
  const [tasks, profiles] = await Promise.all([getTasks(), getProfiles()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tâches"
        description="Toutes les tâches du projet, par prestataire et par statut."
      />
      <TasksView tasks={tasks} profiles={profiles} />
    </div>
  );
}
