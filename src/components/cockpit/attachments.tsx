"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Paperclip,
  FileText,
  Loader2,
  X,
  ExternalLink,
  UploadCloud,
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { addAttachment, deleteAttachment } from "@/app/actions/cockpit";
import { formatBytes } from "@/lib/format";

const BUCKET = "project-docs";
const MAX_BYTES = 25 * 1024 * 1024; // 25 Mo

export type AttachmentView = {
  id: string;
  name: string;
  href: string | null;
  size_bytes: number | null;
  uploaded_by: string | null;
};

export function Attachments({
  entityType,
  entityId,
  items,
  canAttach,
  currentUserId,
  isAdmin,
}: {
  entityType: "question" | "decision";
  entityId: string;
  items: AttachmentView[];
  canAttach: boolean;
  currentUserId: string | null;
  isAdmin: boolean;
}) {
  if (items.length === 0 && !canAttach) return null;

  const canDelete = (a: AttachmentView) =>
    isAdmin || (currentUserId != null && a.uploaded_by === currentUserId);

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {items.map((a) => (
        <span
          key={a.id}
          className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 py-1 pl-2 pr-1 text-xs"
        >
          <FileText className="size-3.5 shrink-0 text-muted-foreground" />
          {a.href ? (
            <a
              href={a.href}
              target="_blank"
              rel="noopener noreferrer"
              className="max-w-52 truncate font-medium text-brand hover:underline"
              title={a.name}
            >
              {a.name}
            </a>
          ) : (
            <span className="max-w-52 truncate font-medium" title={a.name}>
              {a.name}
            </span>
          )}
          {a.size_bytes != null && (
            <span className="text-muted-foreground">
              · {formatBytes(a.size_bytes)}
            </span>
          )}
          {canDelete(a) && <RemoveAttachment id={a.id} name={a.name} />}
        </span>
      ))}
      {canAttach && (
        <AddAttachmentDialog entityType={entityType} entityId={entityId} />
      )}
    </div>
  );
}

function RemoveAttachment({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  function remove() {
    start(async () => {
      const r = await deleteAttachment(id);
      if (!r.ok) toast.error("Suppression impossible", { description: r.error });
      else toast.success("Document retiré");
    });
  }
  return (
    <button
      type="button"
      onClick={remove}
      disabled={pending}
      className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
      title={`Retirer « ${name} »`}
    >
      {pending ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <X className="size-3" />
      )}
      <span className="sr-only">Retirer</span>
    </button>
  );
}

function AddAttachmentDialog({
  entityType,
  entityId,
}: {
  entityType: "question" | "decision";
  entityId: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [files, setFiles] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  function reset() {
    setFiles([]);
    setLinkUrl("");
    setLinkName("");
    if (fileInput.current) fileInput.current.value = "";
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const tooBig = picked.find((f) => f.size > MAX_BYTES);
    if (tooBig) {
      toast.error("Fichier trop volumineux", {
        description: `« ${tooBig.name} » dépasse 25 Mo.`,
      });
      return;
    }
    setFiles(picked);
  }

  function submit() {
    const url = linkUrl.trim();
    if (files.length === 0 && !url) {
      toast.error("Choisissez un fichier ou saisissez un lien.");
      return;
    }
    start(async () => {
      const supabase = createClient();
      let added = 0;

      for (const file of files) {
        const safe = file.name.replace(/[^\w.\-]+/g, "_").slice(-120);
        const path = `${entityType}/${entityId}/${crypto.randomUUID()}-${safe}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, {
            contentType: file.type || undefined,
            upsert: false,
          });
        if (upErr) {
          toast.error("Envoi impossible", {
            description: `${file.name} : ${upErr.message}`,
          });
          continue;
        }
        const r = await addAttachment({
          entity_type: entityType,
          entity_id: entityId,
          name: file.name,
          storage_path: path,
          mime_type: file.type || undefined,
          size_bytes: file.size,
        });
        if (r.ok) added += 1;
        else toast.error("Enregistrement impossible", { description: r.error });
      }

      if (url) {
        const r = await addAttachment({
          entity_type: entityType,
          entity_id: entityId,
          name: linkName.trim() || url,
          url,
        });
        if (r.ok) added += 1;
        else toast.error("Lien invalide", { description: r.error });
      }

      if (added > 0) {
        toast.success(added > 1 ? `${added} documents joints` : "Document joint");
        reset();
        setOpen(false);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" />
        }
      >
        <Paperclip className="size-3.5" />
        Joindre un document
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Joindre un document</DialogTitle>
          <DialogDescription>
            Téléversez un fichier (25 Mo max) ou collez un lien externe (Drive,
            Figma, Notion…).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="att-file">Fichier</Label>
            <label
              htmlFor="att-file"
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted/40"
            >
              <UploadCloud className="size-4 shrink-0" />
              {files.length > 0
                ? files.map((f) => f.name).join(", ")
                : "Choisir un ou plusieurs fichiers…"}
            </label>
            <input
              ref={fileInput}
              id="att-file"
              type="file"
              multiple
              className="sr-only"
              onChange={onPick}
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou un lien
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="att-url">Lien (URL)</Label>
              <Input
                id="att-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="att-name">Intitulé (optionnel)</Label>
              <Input
                id="att-name"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                placeholder="Ex. Maquette Figma"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Annuler</DialogClose>
          <Button onClick={submit} disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ExternalLink className="size-4" />
            )}
            Joindre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
