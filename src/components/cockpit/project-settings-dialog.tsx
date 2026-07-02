"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Settings2, Loader2, Plus, X } from "lucide-react";
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
import { updateProject } from "@/app/actions/cockpit";

export function ProjectSettingsDialog({
  project,
  label = "Configurer le projet",
}: {
  project: {
    name: string;
    client_name: string | null;
    description: string | null;
    objectives: string[];
    start_date: string | null;
    target_date: string | null;
    progress: number;
  };
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [name, setName] = useState(project.name ?? "");
  const [clientName, setClientName] = useState(project.client_name ?? "");
  const [description, setDescription] = useState(project.description ?? "");
  const [objectives, setObjectives] = useState<string[]>(
    project.objectives.length ? project.objectives : [""],
  );
  const [startDate, setStartDate] = useState(project.start_date ?? "");
  const [targetDate, setTargetDate] = useState(project.target_date ?? "");
  const [progress, setProgress] = useState<number>(project.progress ?? 0);

  function setObjective(i: number, v: string) {
    setObjectives((prev) => prev.map((o, idx) => (idx === i ? v : o)));
  }
  function addObjective() {
    setObjectives((prev) => [...prev, ""]);
  }
  function removeObjective(i: number) {
    setObjectives((prev) => prev.filter((_, idx) => idx !== i));
  }

  function submit() {
    if (!name.trim()) return toast.error("Le nom du projet est requis.");
    start(async () => {
      const r = await updateProject({
        name,
        client_name: clientName,
        description,
        objectives: objectives.map((o) => o.trim()).filter(Boolean),
        start_date: startDate,
        target_date: targetDate,
        progress,
      });
      if (!r.ok) {
        toast.error("Enregistrement impossible", { description: r.error });
        return;
      }
      toast.success("Projet mis à jour");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Settings2 className="size-4" />
        {label}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurer le projet</DialogTitle>
          <DialogDescription>
            Renseignez la vision, les objectifs et l&apos;avancement du projet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nom du projet</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Vision / description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="En quelques phrases : à quoi sert ce projet ?"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Objectifs</Label>
            <div className="space-y-2">
              {objectives.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={o}
                    onChange={(e) => setObjective(i, e.target.value)}
                    placeholder={`Objectif ${i + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeObjective(i)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addObjective}>
                <Plus className="size-4" />
                Ajouter un objectif
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Démarrage</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Échéance</Label>
              <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Avancement (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
              />
            </div>
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
