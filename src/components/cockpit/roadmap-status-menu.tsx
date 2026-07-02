"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ROADMAP_STATUS_LABELS, type RoadmapStatus } from "@/lib/constants";
import { updateRoadmapStatus } from "@/app/actions/cockpit";

const ORDER: RoadmapStatus[] = ["planned", "in_progress", "done"];
const BADGE: Record<RoadmapStatus, string> = {
  planned: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
};

export function RoadmapStatusMenu({
  id,
  status,
  editable,
}: {
  id: string;
  status: RoadmapStatus;
  editable: boolean;
}) {
  const [pending, start] = useTransition();

  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        BADGE[status],
      )}
    >
      {ROADMAP_STATUS_LABELS[status]}
      {editable &&
        (pending ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <ChevronDown className="size-3" />
        ))}
    </span>
  );

  if (!editable) return badge;

  function change(next: RoadmapStatus) {
    if (next === status) return;
    start(async () => {
      const r = await updateRoadmapStatus(id, next);
      if (!r.ok) toast.error("Échec", { description: r.error });
      else toast.success(`Statut → ${ROADMAP_STATUS_LABELS[next]}`);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" disabled={pending}>
          {badge}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {ORDER.map((s) => (
          <DropdownMenuItem key={s} onClick={() => change(s)}>
            {ROADMAP_STATUS_LABELS[s]}
            {s === status && <Check className="ml-auto size-3.5 text-brand" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
