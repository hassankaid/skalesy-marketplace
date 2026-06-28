"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Loader2, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { resolveBlocker, reopenBlocker } from "@/app/actions/cockpit";

export function BlockerActions({
  blockerId,
  status,
}: {
  blockerId: string;
  status: "open" | "resolved";
}) {
  const [open, setOpen] = useState(false);
  const [resolution, setResolution] = useState("");
  const [pending, start] = useTransition();

  if (status === "resolved") {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await reopenBlocker(blockerId);
            if (!r.ok) toast.error("Échec", { description: r.error });
            else toast.success("Blocage rouvert");
          })
        }
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RotateCcw className="size-4" />
        )}
        Rouvrir
      </Button>
    );
  }

  function submit() {
    start(async () => {
      const r = await resolveBlocker(blockerId, resolution);
      if (!r.ok) {
        toast.error("Échec", { description: r.error });
        return;
      }
      toast.success("Blocage résolu");
      setOpen(false);
      setResolution("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Check className="size-4" />
        Résoudre
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Résoudre le blocage</DialogTitle>
          <DialogDescription>
            Décris comment le blocage a été levé (optionnel).
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          rows={3}
          placeholder="Résolution…"
        />
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Annuler</DialogClose>
          <Button onClick={submit} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Marquer résolu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
