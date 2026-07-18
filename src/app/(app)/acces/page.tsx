import type { Metadata } from "next";
import { FileText, KeyRound, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { EmptyState } from "@/components/app/empty-state";
import { DomainBadge, OwnerBadge } from "@/components/app/badges";
import { AccessStatusMenu } from "@/components/cockpit/access-status-menu";
import { NewAccessDialog, NewDocumentDialog } from "@/components/cockpit/create-dialogs";
import { DeleteButton } from "@/components/cockpit/delete-button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getAccesses, getDocuments } from "@/lib/queries";
import { getAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { AccessRow } from "@/lib/database.types";

export const metadata: Metadata = { title: "Accès & documents" };

export default async function AccessPage() {
  const [accesses, documents, auth] = await Promise.all([
    getAccesses(),
    getDocuments(),
    getAuth(),
  ]);
  const role = auth?.profile?.role ?? "pending";
  const userId = auth?.user.id ?? null;
  const userDomain = auth?.profile?.provider_domain ?? null;

  const canEditAccess = (a: AccessRow) =>
    role === "skalesy_admin" ||
    role === "client" ||
    (role === "provider" && a.domain != null && a.domain === userDomain);
  const canCreateAccess = role === "skalesy_admin" || role === "provider";
  const isAdmin = role === "skalesy_admin";
  const isMember = role !== "pending";

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
            action={
              canCreateAccess ? (
                <NewAccessDialog
                  defaultDomain={role === "provider" ? userDomain ?? undefined : undefined}
                />
              ) : undefined
            }
          >
            {accesses.length === 0 ? (
              <div className="p-5">
                <EmptyState icon={KeyRound} title="Aucun accès référencé" />
              </div>
            ) : (
              <ul className="divide-y">
                {accesses.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
                  >
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
                    <OwnerBadge owner={a.provided_by} />
                    <AccessStatusMenu
                      accessId={a.id}
                      status={a.status}
                      editable={canEditAccess(a)}
                    />
                    {isAdmin && <DeleteButton kind="access" id={a.id} name={a.name} />}
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
            action={isMember ? <NewDocumentDialog /> : undefined}
          >
            {documents.length === 0 ? (
              <div className="p-5">
                <EmptyState icon={FileText} title="Aucun document" />
              </div>
            ) : (
              <ul className="divide-y">
                {documents.map((d) => {
                  const hasLink = d.url && d.url !== "#";
                  const canDelete = isAdmin || d.uploaded_by === userId;
                  return (
                    <li
                      key={d.id}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                        <FileText className="size-4" />
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
                      {canDelete && (
                        <DeleteButton kind="document" id={d.id} name={d.name} />
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
