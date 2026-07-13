import { LogoLockup } from "@/components/brand/logo";
import { SidebarNav } from "./sidebar-nav";
import type { UserRole } from "@/lib/constants";

export function AppSidebar({
  role,
  inboxCount = 0,
}: {
  role: UserRole;
  inboxCount?: number;
}) {
  return (
    <aside className="hidden border-r bg-sidebar lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
      <div className="flex h-16 shrink-0 items-center border-b px-5">
        <LogoLockup />
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav role={role} inboxCount={inboxCount} />
      </div>
      <div className="shrink-0 border-t px-5 py-3">
        <p className="text-[0.7rem] text-muted-foreground">
          © {new Date().getFullYear()} Skalesy · Espace privé
        </p>
      </div>
    </aside>
  );
}
