import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getInboxCount } from "@/lib/queries";
import { AppSidebar } from "@/components/app/app-sidebar";
import { Topbar } from "@/components/app/topbar";
import { PendingAccess } from "@/components/app/pending-access";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireAuth();

  if (!profile || profile.role === "pending") {
    return <PendingAccess email={user.email ?? null} />;
  }

  let projectName: string | null = null;
  let progress: number | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("projects")
      .select("name, progress")
      .limit(1)
      .maybeSingle();
    if (data) {
      projectName = data.name as string;
      progress = data.progress as number;
    }
  } catch {
    // projects table not ready yet — render shell without project header
  }

  let inboxCount = 0;
  try {
    inboxCount = (await getInboxCount()).total;
  } catch {
    // notifications table not ready yet — hide the badge
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <AppSidebar role={profile.role} inboxCount={inboxCount} />
      <div className="flex min-h-dvh flex-col">
        <Topbar
          role={profile.role}
          fullName={profile.full_name}
          email={user.email ?? null}
          projectName={projectName}
          progress={progress}
          inboxCount={inboxCount}
        />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
