"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
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
import {
  PROVIDER_DOMAIN_ORDER,
  PROVIDER_DOMAINS,
  OWNER_SIDE_LABELS,
  PRIORITY_LABELS,
  type ProviderDomain,
  type OwnerSide,
  type Priority,
} from "@/lib/constants";
import { createTask } from "@/app/actions/cockpit";

const selectClass =
  "flex h-9 w-full rounded-lg border bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function NewTaskDialog({
  defaultDomain,
}: {
  defaultDomain?: ProviderDomain;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState<ProviderDomain | "">(defaultDomain ?? "");
  const [owner, setOwner] = useState<OwnerSide>("provider");
  const [priority, setPriority] = useState<Priority>("medium");
  const [due, setDue] = useState("");

  function submit() {
    if (!title.trim()) {
      toast.error("Le titre est requis.");
      return;
    }
    start(async () => {
      const r = await createTask({
        title,
        description,
        domain,
        owner_side: owner,
        priority,
        due_date: due,
      });
      if (!r.ok) {
        toast.error("Création impossible", { description: r.error });
        return;
      }
      toast.success("Tâche créée");
      setOpen(false);
      setTitle("");
      setDescription("");
      setDue("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="size-4" />
        Nouvelle tâche
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle tâche</DialogTitle>
          <DialogDescription>
            Ajoute une tâche au projet et assigne-la à un prestataire ou au client.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="t-title">Titre</Label>
            <Input
              id="t-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. Intégrer le module de paiement"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-desc">Description (optionnel)</Label>
            <Textarea
              id="t-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="t-domain">Domaine</Label>
              <select
                id="t-domain"
                className={selectClass}
                value={domain}
                onChange={(e) => setDomain(e.target.value as ProviderDomain | "")}
              >
                <option value="">Transverse</option>
                {PROVIDER_DOMAIN_ORDER.map((d) => (
                  <option key={d} value={d}>
                    {PROVIDER_DOMAINS[d].short}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-owner">Responsable</Label>
              <select
                id="t-owner"
                className={selectClass}
                value={owner}
                onChange={(e) => setOwner(e.target.value as OwnerSide)}
              >
                {(["provider", "client", "skalesy"] as OwnerSide[]).map((o) => (
                  <option key={o} value={o}>
                    {OWNER_SIDE_LABELS[o]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-priority">Priorité</Label>
              <select
                id="t-priority"
                className={selectClass}
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {(["low", "medium", "high", "urgent"] as Priority[]).map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-due">Échéance</Label>
              <Input
                id="t-due"
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Annuler</DialogClose>
          <Button onClick={submit} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Créer la tâche
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
