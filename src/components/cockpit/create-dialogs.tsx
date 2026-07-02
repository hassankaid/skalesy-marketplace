"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Loader2, FileUp } from "lucide-react";
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
  DomainSelect,
  OwnerSelect,
  PrioritySelect,
  selectClass,
} from "@/components/cockpit/fields";
import {
  createQuestion,
  createBlocker,
  createDecision,
  createAccess,
  createDocument,
  createRoadmapItem,
} from "@/app/actions/cockpit";
import type {
  ProviderDomain,
  OwnerSide,
  Priority,
  RoadmapStatus,
} from "@/lib/constants";

/* --- shared shell --- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function FormDialog({
  trigger,
  title,
  description,
  open,
  setOpen,
  pending,
  onSubmit,
  submitLabel = "Créer",
  children,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  pending: boolean;
  onSubmit: () => void;
  submitLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-3">{children}</div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Annuler</DialogClose>
          <Button onClick={onSubmit} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --- Question --- */

export function NewQuestionDialog({
  defaultDomain,
}: {
  defaultDomain?: ProviderDomain;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [body, setBody] = useState("");
  const [domain, setDomain] = useState<ProviderDomain | "">(defaultDomain ?? "");
  const [directedTo, setDirectedTo] = useState<OwnerSide>("client");
  const [priority, setPriority] = useState<Priority>("medium");

  function submit() {
    if (!body.trim()) return toast.error("La question est requise.");
    start(async () => {
      const r = await createQuestion({ body, domain, directed_to: directedTo, priority });
      if (!r.ok) {
        toast.error("Création impossible", { description: r.error });
        return;
      }
      toast.success("Question ajoutée");
      setOpen(false);
      setBody("");
    });
  }

  return (
    <FormDialog
      trigger={<><Plus className="size-4" />Nouvelle question</>}
      title="Nouvelle question"
      open={open}
      setOpen={setOpen}
      pending={pending}
      onSubmit={submit}
    >
      <Field label="Question">
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Domaine">
          <DomainSelect value={domain} onChange={setDomain} />
        </Field>
        <Field label="Adressée à">
          <OwnerSelect value={directedTo} onChange={setDirectedTo} />
        </Field>
      </div>
      <Field label="Priorité">
        <PrioritySelect value={priority} onChange={setPriority} />
      </Field>
    </FormDialog>
  );
}

/* --- Blocker --- */

export function NewBlockerDialog({
  defaultDomain,
}: {
  defaultDomain?: ProviderDomain;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState<ProviderDomain | "">(defaultDomain ?? "");
  const [severity, setSeverity] = useState<Priority>("high");

  function submit() {
    if (!title.trim()) return toast.error("Le titre est requis.");
    start(async () => {
      const r = await createBlocker({ title, description, domain, severity });
      if (!r.ok) {
        toast.error("Création impossible", { description: r.error });
        return;
      }
      toast.success("Blocage signalé");
      setOpen(false);
      setTitle("");
      setDescription("");
    });
  }

  return (
    <FormDialog
      trigger={<><Plus className="size-4" />Signaler un blocage</>}
      title="Signaler un blocage"
      open={open}
      setOpen={setOpen}
      pending={pending}
      onSubmit={submit}
      submitLabel="Signaler"
    >
      <Field label="Titre">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Description">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Domaine">
          <DomainSelect value={domain} onChange={setDomain} />
        </Field>
        <Field label="Gravité">
          <PrioritySelect value={severity} onChange={setSeverity} />
        </Field>
      </div>
    </FormDialog>
  );
}

/* --- Decision --- */

export function NewDecisionDialog() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [decision, setDecision] = useState("");
  const [domain, setDomain] = useState<ProviderDomain | "">("");

  function submit() {
    if (!title.trim()) return toast.error("Le titre est requis.");
    start(async () => {
      const r = await createDecision({ title, context, decision, domain });
      if (!r.ok) {
        toast.error("Création impossible", { description: r.error });
        return;
      }
      toast.success("Décision ajoutée");
      setOpen(false);
      setTitle("");
      setContext("");
      setDecision("");
    });
  }

  return (
    <FormDialog
      trigger={<><Plus className="size-4" />Nouvelle décision</>}
      title="Nouvelle décision"
      open={open}
      setOpen={setOpen}
      pending={pending}
      onSubmit={submit}
    >
      <Field label="Titre">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Contexte">
        <Textarea value={context} onChange={(e) => setContext(e.target.value)} rows={2} />
      </Field>
      <Field label="Décision">
        <Textarea value={decision} onChange={(e) => setDecision(e.target.value)} rows={2} />
      </Field>
      <Field label="Domaine">
        <DomainSelect value={domain} onChange={setDomain} />
      </Field>
    </FormDialog>
  );
}

/* --- Access --- */

export function NewAccessDialog({
  defaultDomain,
}: {
  defaultDomain?: ProviderDomain;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState<ProviderDomain | "">(defaultDomain ?? "");
  const [providedBy, setProvidedBy] = useState<OwnerSide>("client");
  const [notes, setNotes] = useState("");

  function submit() {
    if (!name.trim()) return toast.error("Le nom de l'accès est requis.");
    start(async () => {
      const r = await createAccess({
        name,
        description,
        domain,
        provided_by: providedBy,
        notes,
      });
      if (!r.ok) {
        toast.error("Création impossible", { description: r.error });
        return;
      }
      toast.success("Accès ajouté");
      setOpen(false);
      setName("");
      setDescription("");
      setNotes("");
    });
  }

  return (
    <FormDialog
      trigger={<><Plus className="size-4" />Nouvel accès</>}
      title="Nouvel accès"
      description="Ne stockez pas de mot de passe ici — seulement le libellé et une note."
      open={open}
      setOpen={setOpen}
      pending={pending}
      onSubmit={submit}
    >
      <Field label="Nom de l'accès">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Compte Google Ads" />
      </Field>
      <Field label="Description">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Domaine">
          <DomainSelect value={domain} onChange={setDomain} />
        </Field>
        <Field label="Fourni par">
          <OwnerSelect value={providedBy} onChange={setProvidedBy} />
        </Field>
      </div>
      <Field label="Note (optionnel)">
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
    </FormDialog>
  );
}

/* --- Document --- */

export function NewDocumentDialog({
  defaultDomain,
}: {
  defaultDomain?: ProviderDomain;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [url, setUrl] = useState("");
  const [domain, setDomain] = useState<ProviderDomain | "">(defaultDomain ?? "");

  function submit() {
    if (!name.trim()) return toast.error("Le nom du document est requis.");
    start(async () => {
      const r = await createDocument({ name, category, url, domain });
      if (!r.ok) {
        toast.error("Création impossible", { description: r.error });
        return;
      }
      toast.success("Document ajouté");
      setOpen(false);
      setName("");
      setCategory("");
      setUrl("");
    });
  }

  return (
    <FormDialog
      trigger={<><FileUp className="size-4" />Ajouter un document</>}
      title="Ajouter un document"
      description="Lien vers un document externe (Drive, Figma, Notion…)."
      open={open}
      setOpen={setOpen}
      pending={pending}
      onSubmit={submit}
      submitLabel="Ajouter"
    >
      <Field label="Nom">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Catégorie">
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Cadrage, Design…" />
        </Field>
        <Field label="Domaine">
          <DomainSelect value={domain} onChange={setDomain} />
        </Field>
      </div>
      <Field label="Lien (URL)">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
      </Field>
    </FormDialog>
  );
}

/* --- Roadmap item --- */

export function NewRoadmapDialog() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState("");
  const [domain, setDomain] = useState<ProviderDomain | "">("");
  const [status, setStatus] = useState<RoadmapStatus>("planned");

  function submit() {
    if (!title.trim()) return toast.error("Le titre est requis.");
    start(async () => {
      const r = await createRoadmapItem({ title, description, phase, domain, status });
      if (!r.ok) {
        toast.error("Création impossible", { description: r.error });
        return;
      }
      toast.success("Étape ajoutée");
      setOpen(false);
      setTitle("");
      setDescription("");
      setPhase("");
    });
  }

  return (
    <FormDialog
      trigger={<><Plus className="size-4" />Nouvelle étape</>}
      title="Nouvelle étape de roadmap"
      open={open}
      setOpen={setOpen}
      pending={pending}
      onSubmit={submit}
    >
      <Field label="Titre">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Description">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phase">
          <Input value={phase} onChange={(e) => setPhase(e.target.value)} placeholder="Cadrage, Développement…" />
        </Field>
        <Field label="Domaine">
          <DomainSelect value={domain} onChange={setDomain} />
        </Field>
      </div>
      <Field label="Statut">
        <select
          className={selectClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as RoadmapStatus)}
        >
          <option value="planned">Planifié</option>
          <option value="in_progress">En cours</option>
          <option value="done">Terminé</option>
        </select>
      </Field>
    </FormDialog>
  );
}
