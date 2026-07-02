import type { Metadata } from "next";
import {
  Building2,
  UserSquare,
  Boxes,
  Eye,
  ShieldCheck,
  RefreshCw,
  ListChecks,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { TestChecklist } from "@/components/guide/test-checklist";

export const metadata: Metadata = { title: "Guide & prise en main" };

export default function GuidePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Guide & prise en main"
        description="Bienvenue 👋 Voici comment fonctionne la plateforme et un déroulé simple pour la découvrir et la tester en quelques minutes."
      />

      {/* En bref */}
      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          En bref
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/90">
          Ce cockpit est le <strong>point central du projet marketplace</strong>. Tout y
          est réuni : la vision et les objectifs, les tâches de chaque intervenant, les
          questions en attente, les blocages, les décisions, les accès et la roadmap.
          L&apos;idée : <strong>fini les échanges éparpillés</strong> entre mails, messages et
          documents — chacun voit la même information, à jour en temps réel, et sait
          exactement <strong>ce qui est fait, ce qui est en attente et qui doit faire quoi</strong>.
        </p>
      </section>

      {/* Rôles */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Les 3 profils
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <RoleCard
            icon={Building2}
            title="Skalesy"
            text="Pilote le projet : coordonne les prestataires, suit l'avancement global et cadre la roadmap et les décisions."
          />
          <RoleCard
            icon={UserSquare}
            title="Client"
            text="Fait avancer ce qui dépend de lui : répond aux questions, valide les décisions, fournit les accès et les contenus."
          />
          <RoleCard
            icon={Boxes}
            title="Prestataires"
            text="Chaque expert (dev, design, branding, acquisition, SEO) gère son espace : ses tâches, ses questions et ses blocages."
          />
        </div>
      </section>

      {/* Déroulé de test */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <ListChecks className="size-4 text-brand" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Déroulé de test guidé
          </h2>
        </div>
        <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
          Suivez ces étapes dans l&apos;ordre pour prendre la plateforme en main. Cochez
          au fur et à mesure — votre progression est conservée sur cet appareil. Chaque
          badge indique le profil concerné (en tant qu&apos;admin, vous pouvez tout tester).
        </p>
        <TestChecklist />
      </section>

      {/* Bon à savoir */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Bon à savoir
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <TipCard
            icon={RefreshCw}
            title="Toujours à jour"
            text="Chaque modification est visible immédiatement par tous les membres du projet."
          />
          <TipCard
            icon={ShieldCheck}
            title="Chacun son périmètre"
            text="Un prestataire ne modifie que son domaine, le client que ses actions. Tout est sécurisé."
          />
          <TipCard
            icon={Eye}
            title="Transparence totale"
            text="Tout le monde voit l'ensemble du projet, mais aucun accès ni mot de passe sensible n'est stocké ici."
          />
        </div>
      </section>
    </div>
  );
}

function RoleCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Building2;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-5" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function TipCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Building2;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-1.5 flex items-center gap-2">
        <Icon className="size-4 text-brand" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
