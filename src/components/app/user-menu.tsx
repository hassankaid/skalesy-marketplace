"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { ROLE_LABELS, type UserRole } from "@/lib/constants";

function initials(name: string | null, email: string | null) {
  const base = name?.trim() || email?.split("@")[0] || "?";
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return letters.toUpperCase() || base[0]?.toUpperCase() || "?";
}

export function UserMenu({
  fullName,
  email,
  role,
}: {
  fullName: string | null;
  email: string | null;
  role: UserRole;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none ring-ring focus-visible:ring-2">
        <Avatar className="size-9 border">
          <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
            {initials(fullName, email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate font-medium">{fullName ?? "Membre"}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {email}
          </span>
          <span className="mt-1 w-fit rounded-full bg-accent px-2 py-0.5 text-[0.7rem] font-medium text-accent-foreground">
            {ROLE_LABELS[role]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem
            variant="destructive"
            render={<button type="submit" className="w-full cursor-pointer" />}
          >
            <LogOut className="size-4" />
            Se déconnecter
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
