import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { MemberAdmin } from "@/components/cockpit/member-admin";
import { getAuth } from "@/lib/auth";
import { getAllowedMembers, getProject } from "@/lib/queries";

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

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Membres autorisés
        </h2>
        <MemberAdmin members={members} />
      </div>

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
        L&apos;ajout prend effet à la prochaine connexion de la personne.
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
