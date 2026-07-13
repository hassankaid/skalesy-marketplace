"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/app/actions/cockpit";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MarkAllReadButton() {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await markAllNotificationsRead();
          if (!r.ok) toast.error("Échec", { description: r.error });
        })
      }
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <CheckCheck className="size-4" />
      )}
      Tout marquer comme lu
    </Button>
  );
}

export function MentionNotification({
  id,
  href,
  unread,
  actorName,
  entityLabel,
  preview,
  timeLabel,
}: {
  id: string;
  href: string;
  unread: boolean;
  actorName: string;
  entityLabel: string;
  preview: string | null;
  timeLabel: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function open() {
    start(async () => {
      if (unread) {
        const r = await markNotificationRead(id);
        if (!r.ok) {
          toast.error("Échec", { description: r.error });
          return;
        }
      }
      router.push(href);
    });
  }

  return (
    <button
      type="button"
      onClick={open}
      disabled={pending}
      className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/40 disabled:opacity-60"
    >
      <span
        className={cn(
          "mt-2 size-2 shrink-0 rounded-full",
          unread ? "bg-brand" : "bg-transparent",
        )}
        aria-hidden
      />
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
        {initials(actorName)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-sm">
          <span className="font-medium">{actorName}</span> t&apos;a mentionné dans{" "}
          {entityLabel}
        </span>
        {preview && (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {preview}
          </span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {timeLabel && (
          <span className="text-xs text-muted-foreground">{timeLabel}</span>
        )}
        {pending && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
      </span>
    </button>
  );
}
