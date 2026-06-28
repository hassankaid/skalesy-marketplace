"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/app/badges";
import {
  TASK_STATUS_ORDER,
  TASK_STATUS_LABELS,
  STATUS_DOT_CLASS,
  type TaskStatus,
} from "@/lib/constants";
import { updateTaskStatus } from "@/app/actions/cockpit";

export function TaskStatusMenu({
  taskId,
  status,
  editable,
}: {
  taskId: string;
  status: TaskStatus;
  editable: boolean;
}) {
  const [pending, start] = useTransition();

  if (!editable) return <StatusBadge status={status} />;

  function change(next: TaskStatus) {
    if (next === status) return;
    start(async () => {
      const r = await updateTaskStatus(taskId, next);
      if (!r.ok) toast.error("Échec de la mise à jour", { description: r.error });
      else toast.success(`Statut mis à jour → ${TASK_STATUS_LABELS[next]}`);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            disabled={pending}
          />
        }
      >
        <StatusBadge status={status} />
        {pending ? (
          <Loader2 className="size-3 animate-spin text-muted-foreground" />
        ) : (
          <ChevronDown className="size-3 text-muted-foreground" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {TASK_STATUS_ORDER.map((s) => (
          <DropdownMenuItem key={s} onClick={() => change(s)}>
            <span className={cn("size-1.5 rounded-full", STATUS_DOT_CLASS[s])} />
            {TASK_STATUS_LABELS[s]}
            {s === status && <Check className="ml-auto size-3.5 text-brand" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
