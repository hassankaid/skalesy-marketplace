"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
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
import {
  deleteTask,
  deleteQuestion,
  deleteBlocker,
  deleteDecision,
  deleteAccess,
  deleteDocument,
  deleteRoadmapItem,
} from "@/app/actions/cockpit";

type Kind =
  | "task"
  | "question"
  | "blocker"
  | "decision"
  | "access"
  | "document"
  | "roadmap";

const ACTIONS: Record<Kind, (id: string) => Promise<{ ok: boolean; error?: string }>> = {
  task: deleteTask,
  question: deleteQuestion,
  blocker: deleteBlocker,
  decision: deleteDecision,
  access: deleteAccess,
  document: deleteDocument,
  roadmap: deleteRoadmapItem,
};

export function DeleteButton({
  kind,
  id,
  name,
}: {
  kind: Kind;
  id: string;
  name?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function confirm() {
    start(async () => {
      const r = await ACTIONS[kind](id);
      if (!r.ok) {
        toast.error("Suppression impossible", { description: r.error });
        return;
      }
      toast.success("Supprimé");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
          />
        }
      >
        <Trash2 className="size-4" />
        <span className="sr-only">Supprimer</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Supprimer&nbsp;?</DialogTitle>
          <DialogDescription>
            {name ? `« ${name} »` : "Cet élément"} sera définitivement supprimé.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Annuler</DialogClose>
          <Button variant="destructive" onClick={confirm} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
