"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateWorkspace } from "@/app/actions/cockpit";

export function WorkspaceEditDialog({
  workspaceId,
  summary,
  needs,
  recommendations,
  progress,
}: {
  workspaceId: string;
  summary: string | null;
  needs: string | null;
  recommendations: string | null;
  progress: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [s, setS] = useState(summary ?? "");
  const [n, setN] = useState(needs ?? "");
  const [r, setR] = useState(recommendations ?? "");
  const [p, setP] = useState<number>(progress ?? 0);

  function submit() {
    start(async () => {
      const res = await updateWorkspace(workspaceId, {
        summary: s,
        needs: n,
        recommendations: r,
        progress: p,
      });
      if (!res.ok) {
        toast.error("Enregistrement impossible", { description: res.error });
        return;
      }
      toast.success("Espace mis à jour");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Pencil className="size-4" />
        Modifier l&apos;espace
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;espace</DialogTitle>
          <DialogDescription>
            Vision, besoins, recommandations et avancement de ce domaine.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Vision</Label>
            <Textarea value={s} onChange={(e) => setS(e.target.value)} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>Besoins</Label>
            <Textarea value={n} onChange={(e) => setN(e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Recommandations</Label>
            <Textarea value={r} onChange={(e) => setR(e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Avancement (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={p}
              onChange={(e) => setP(Number(e.target.value))}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Annuler</DialogClose>
          <Button onClick={submit} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
