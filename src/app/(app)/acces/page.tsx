import type { Metadata } from "next";
import { FileText, KeyRound, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { EmptyState } from "@/components/app/empty-state";
import { DomainBadge, OwnerBadge } from "@/components/app/badges";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ACCESS_STATUS_LABELS, ACCESS_STATUS_BADGE_CLASS } from "@/lib/constants";
import { getAccesses, getDocuments } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Accès & documents" };

export default async function AccessPage() {
  const [accesses, documents] = await Promise.all([
    getAccesses(),
    getDocuments(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accès & documents"
        description="Les accès nécessaires au projet et les documents partagés, centralisés. Aucun mot de passe n'est stocké ici."
      />

      <Tabs defaultValue="acces">
        <TabsList>
          <TabsTrigger value="acces">
            <KeyRound /> Accès
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText /> Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="acces" className="mt-4">
          <SectionCard
            title="Accès nécessaires"
            description={`${accesses.length} accès`}
            noPadding
          >
            {accesses.length === 0 ? (
              <div className="p-5">
                <EmptyState icon={KeyRound} title="Aucun accès référencé" />
              </div>
            ) : (
              <ul className="divide-y">
                {accesses.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{a.name}</p>
                      {a.description && (
                        <p className="text-xs text-muted-foreground">
                          {a.description}
                        </p>
                      )}
                      {a.notes && (
                        <p className="mt-0.5 text-xs text-muted-foreground/80">
                          Note : {a.notes}
                        </p>
                      )}
                    </div>
                    <DomainBadge domain={a.domain} />
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                      par
                    </span>
                    <OwnerBadge owner={a.provided_by} />
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${ACCESS_STATUS_BADGE_CLASS[a.status]}`}
                    >
                      {ACCESS_STATUS_LABELS[a.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <SectionCard
            title="Documents partagés"
            description={`${documents.length} document(s)`}
            noPadding
          >
            {documents.length === 0 ? (
              <div className="p-5">
                <EmptyState icon={FileText} title="Aucun document" />
              </div>
            ) : (
              <ul className="divide-y">
                {documents.map((d) => {
                  const hasLink = d.url && d.url !== "#";
                  return (
                    <li
                      key={d.id}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                        <FileText className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{d.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.category ?? "Document"} ·{" "}
                          {formatDate(d.created_at, "d MMM yyyy")}
                        </p>
                      </div>
                      <DomainBadge domain={d.domain} />
                      {hasLink && (
                        <a
                          href={d.url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                        >
                          Ouvrir <ExternalLink className="size-3.5" />
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
