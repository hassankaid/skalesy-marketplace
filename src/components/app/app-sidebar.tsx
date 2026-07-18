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
    <aside className="gradient-rail relative hidden overflow-hidden text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
      {/* soft light bloom for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-20 size-72 rounded-full bg-white/10 blur-3xl"
      />
      <div className="relative flex h-16 shrink-0 items-center border-b border-white/10 px-5">
        <LogoLockup variant="white" />
      </div>
      <div className="rail-scroll relative flex-1 overflow-y-auto">
        <SidebarNav role={role} inboxCount={inboxCount} />
      </div>
      <div className="relative shrink-0 border-t border-white/10 px-5 py-3">
        <p className="text-[0.7rem] text-white/50">
          © {new Date().getFullYear()} Skalesy · Espace privé
        </p>
      </div>
    </aside>
  );
}
