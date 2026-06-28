"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ACCESS_STATUS_LABELS,
  ACCESS_STATUS_BADGE_CLASS,
  type AccessStatus,
} from "@/lib/constants";
import { updateAccessStatus } from "@/app/actions/cockpit";

const ORDER: AccessStatus[] = ["needed", "requested", "provided", "confirmed"];

export function AccessStatusMenu({
  accessId,
  status,
  editable,
}: {
  accessId: string;
  status: AccessStatus;
  editable: boolean;
}) {
  const [pending, start] = useTransition();

  const badge = (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${ACCESS_STATUS_BADGE_CLASS[status]}`}
    >
      {ACCESS_STATUS_LABELS[status]}
      {editable &&
        (pending ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <ChevronDown className="size-3" />
        ))}
    </span>
  );

  if (!editable) return badge;

  function change(next: AccessStatus) {
    if (next === status) return;
    start(async () => {
      const r = await updateAccessStatus(accessId, next);
      if (!r.ok) toast.error("Échec", { description: r.error });
      else toast.success(`Accès → ${ACCESS_STATUS_LABELS[next]}`);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<button type="button" disabled={pending} />}
      >
        {badge}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {ORDER.map((s) => (
          <DropdownMenuItem key={s} onClick={() => change(s)}>
            {ACCESS_STATUS_LABELS[s]}
            {s === status && <Check className="ml-auto size-3.5 text-brand" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
