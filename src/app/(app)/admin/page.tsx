import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { EmptyState } from "@/components/app/empty-state";
import { getAuth } from "@/lib/auth";
import { getAllowedMembers, getProject } from "@/lib/queries";
import {
  ROLE_LABELS,
  PROVIDER_DOMAINS,
  type ProviderDomain,
} from "@/lib/constants";

export const metadata: Metadata = { title: "Administration" };

export default async function AdminPage() {
  const auth = await getAuth();
  if (auth?.profile?.role !== "skalesy_admin") notFound();

  const [members, project] = await Promise.all([
    getAllowedMembers(),
    getProject(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description="Gestion des accès au cockpit et réglages du projet."
      />

      <SectionCard
        title="Membres autorisés"
        description="Les adresses email autorisées à accéder au cockpit et leur rôle."
        noPadding
      >
        {members.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={Users} title="Aucun membre autorisé" />
          </div>
        ) : (
          <ul className="divide-y">
            {members.map((m) => (
              <li key={m.email} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.email}</p>
                  {m.full_name && (
                    <p className="text-xs text-muted-foreground">
                      {m.full_name}
                    </p>
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
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Projet" noPadding>
        <dl className="divide-y text-sm">
          <Row label="Nom" value={project?.name ?? "—"} />
          <Row label="Client" value={project?.client_name ?? "—"} />
          <Row label="Avancement" value={`${project?.progress ?? 0}%`} />
          <Row label="Statut" value={project?.status ?? "—"} />
        </dl>
      </SectionCard>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-4" />
        Les accès sont contrôlés par la liste ci-dessus et sécurisés par RLS
        Postgres. Un email non listé reçoit un accès « en attente » sans droits.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
