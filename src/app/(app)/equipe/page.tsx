import type { Metadata } from "next";
import { Building2, UserSquare } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ROLE_LABELS,
  PROVIDER_DOMAINS,
  PROVIDER_DOMAIN_ORDER,
  type ProviderDomain,
} from "@/lib/constants";
import { getProfiles } from "@/lib/queries";

export const metadata: Metadata = { title: "Équipe" };

function initials(name: string | null, email: string | null) {
  const base = name?.trim() || email?.split("@")[0] || "?";
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  return (
    ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() ||
    base[0]?.toUpperCase() ||
    "?"
  );
}

export default async function TeamPage() {
  const profiles = (await getProfiles()).filter((p) => p.role !== "pending");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Équipe & rôles"
        description="Qui intervient sur le projet et avec quelles responsabilités."
      />

      <SectionCard title="Membres" description={`${profiles.length} membre(s)`} noPadding>
        {profiles.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            Les membres apparaîtront ici dès leur première connexion.
          </p>
        ) : (
          <ul className="divide-y">
            {profiles.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar className="size-9 border">
                  <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                    {initials(p.full_name, p.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {p.full_name ?? p.email}
                  </p>
                  {p.full_name && p.email && (
                    <p className="truncate text-xs text-muted-foreground">
                      {p.email}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                    {ROLE_LABELS[p.role]}
                  </span>
                  {p.provider_domain && (
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {PROVIDER_DOMAINS[p.provider_domain].short}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Rôles & responsabilités
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <RoleCard
            icon={Building2}
            title="Skalesy"
            text="Pilotage du projet, coordination des prestataires, suivi global et arbitrage des décisions."
          />
          <RoleCard
            icon={UserSquare}
            title="Client"
            text="Validations, réponses aux questions, fourniture des accès et des contenus, confirmation des décisions."
          />
          {PROVIDER_DOMAIN_ORDER.map((d) => (
            <RoleCard
              key={d}
              icon={PROVIDER_DOMAINS[d].icon}
              title={PROVIDER_DOMAINS[d].label}
              text={PROVIDER_DOMAINS[d].description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  icon: Icon,
  title,
  text,
}: {
  icon: (typeof PROVIDER_DOMAINS)[ProviderDomain]["icon"];
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-4" />
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
