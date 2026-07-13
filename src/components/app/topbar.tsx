"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Menu } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { LogoLockup } from "@/components/brand/logo";
import type { UserRole } from "@/lib/constants";

export function Topbar({
  role,
  fullName,
  email,
  projectName,
  progress,
  inboxCount = 0,
}: {
  role: UserRole;
  fullName: string | null;
  email: string | null;
  projectName: string | null;
  progress: number | null;
  inboxCount?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={<Button variant="ghost" size="icon" className="lg:hidden" />}
        >
          <Menu className="size-5" />
          <span className="sr-only">Ouvrir le menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="h-16 justify-center border-b px-5">
            <SheetTitle className="text-left">
              <LogoLockup />
            </SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto">
            <SidebarNav
              role={role}
              inboxCount={inboxCount}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">
            {projectName ?? "Projet"}
          </p>
          <p className="text-xs text-muted-foreground">Cockpit projet</p>
        </div>
        {typeof progress === "number" && (
          <div className="hidden w-40 items-center gap-2 sm:flex">
            <Progress value={progress} className="h-1.5" />
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {progress}%
            </span>
          </div>
        )}
      </div>

      <UserMenu fullName={fullName} email={email} role={role} />
    </header>
  );
}
