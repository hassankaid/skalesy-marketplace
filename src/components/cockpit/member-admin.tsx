"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ROLE_LABELS,
  PROVIDER_DOMAIN_ORDER,
  PROVIDER_DOMAINS,
  type ProviderDomain,
} from "@/lib/constants";
import { inviteMember, removeAllowedMember } from "@/app/actions/cockpit";
import type { AllowedMemberRow } from "@/lib/database.types";

const selectClass =
  "flex h-9 w-full rounded-lg border bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Role = "skalesy_admin" | "client" | "provider";

export function MemberAdmin({ members }: { members: AllowedMemberRow[] }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("provider");
  const [domain, setDomain] = useState<ProviderDomain | "">("dev");
  const [pending, start] = useTransition();
  const [removing, setRemoving] = useState<string | null>(null);

  function add() {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Email invalide.");
      return;
    }
    start(async () => {
      const r = await inviteMember({
        email,
        role,
        provider_domain: role === "provider" ? domain : "",
        full_name: fullName,
      });
      if (!r.ok) {
        toast.error("Échec", { description: r.error });
        return;
      }
      if (r.warning) toast.warning("Accès mis à jour", { description: r.warning });
      else
        toast.success("Invitation envoyée", {
          description: `Un email d'invitation a été envoyé à ${email.trim()}.`,
        });
      setEmail("");
      setFullName("");
    });
  }

  function remove(em: string) {
    setRemoving(em);
    start(async () => {
      const r = await removeAllowedMember(em);
      if (!r.ok) toast.error("Échec", { description: r.error });
      else toast.success("Accès retiré");
      setRemoving(null);
    });
  }

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="rounded-xl border bg-card p-4">
        <p className="text-sm font-semibold">Inviter un membre</p>
        <p className="mb-3 text-xs text-muted-foreground">
          Un email d&apos;invitation est envoyé : la personne définit son mot de
          passe et accède au cockpit avec le rôle choisi.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="m-email">Email</Label>
            <Input
              id="m-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom@entreprise.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-name">Nom (optionnel)</Label>
            <Input
              id="m-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-role">Rôle</Label>
            <select
              id="m-role"
              className={selectClass}
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="skalesy_admin">{ROLE_LABELS.skalesy_admin}</option>
              <option value="client">{ROLE_LABELS.client}</option>
              <option value="provider">{ROLE_LABELS.provider}</option>
            </select>
          </div>
          {role === "provider" && (
            <div className="space-y-1.5">
              <Label htmlFor="m-domain">Domaine</Label>
              <select
                id="m-domain"
                className={selectClass}
                value={domain}
                onChange={(e) => setDomain(e.target.value as ProviderDomain)}
              >
                {PROVIDER_DOMAIN_ORDER.map((d) => (
                  <option key={d} value={d}>
                    {PROVIDER_DOMAINS[d].short}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" onClick={add} disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            Inviter
          </Button>
        </div>
      </div>

      {/* List */}
      <ul className="divide-y rounded-xl border bg-card">
        {members.map((m) => (
          <li key={m.email} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{m.email}</p>
              {m.full_name && (
                <p className="text-xs text-muted-foreground">{m.full_name}</p>
              )}
            </div>
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
              {ROLE_LABELS[m.role]}
            </span>
            {m.provider_domain && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {PROVIDER_DOMAINS[m.provider_domain as ProviderDomain].short}
              </span>
            )}
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              disabled={pending && removing === m.email}
              onClick={() => remove(m.email)}
              title="Retirer l'accès"
            >
              {pending && removing === m.email ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
