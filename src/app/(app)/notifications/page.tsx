import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  MessagesSquare,
  ListChecks,
  Gavel,
  KeyRound,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { EmptyState } from "@/components/app/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  MentionNotification,
  MarkAllReadButton,
} from "@/components/cockpit/notification-items";
import { getMyNotifications, getInboxActionables } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import type { NotificationRow } from "@/lib/database.types";

export const metadata: Metadata = { title: "Notifications" };

const ENTITY: Record<string, { label: string; href: string }> = {
  question: { label: "une question", href: "/questions" },
  decision: { label: "une décision", href: "/decisions" },
  blocker: { label: "un blocage", href: "/blocages" },
};

export default async function NotificationsPage() {
  const [notifs, actionables] = await Promise.all([
    getMyNotifications(),
    getInboxActionables(),
  ]);
  const unread = notifs.filter((n) => !n.read_at);
  const read = notifs.filter((n) => n.read_at);
  const actionableCount =
    actionables.questions.length +
    actionables.tasks.length +
    actionables.decisions.length +
    actionables.accesses.length;
  const toHandle = unread.length + actionableCount;

  const row = (n: NotificationRow) => {
    const e = ENTITY[n.entity_type] ?? { label: "un élément", href: "/" };
    return (
      <MentionNotification
        key={n.id}
        id={n.id}
        href={e.href}
        unread={!n.read_at}
        actorName={n.actor_name ?? "Quelqu'un"}
        entityLabel={e.label}
        preview={n.preview}
        timeLabel={formatDate(n.created_at)}
      />
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Tout ce qui te concerne au même endroit : les mentions et ce qui attend une action de ta part."
      >
        {unread.length > 0 && <MarkAllReadButton />}
      </PageHeader>

      <Tabs defaultValue="todo">
        <TabsList>
          <TabsTrigger value="todo">
            À traiter{toHandle > 0 ? ` (${toHandle})` : ""}
          </TabsTrigger>
          <TabsTrigger value="read">Lu</TabsTrigger>
        </TabsList>

        <TabsContent value="todo" className="mt-4 space-y-6">
          {toHandle === 0 ? (
            <SectionCard noPadding>
              <div className="p-5">
                <EmptyState
                  icon={CheckCircle2}
                  title="Tu es à jour"
                  description="Aucune mention non lue ni action en attente."
                />
              </div>
            </SectionCard>
          ) : (
            <>
              {unread.length > 0 && (
                <SectionCard
                  title="Mentions non lues"
                  description={`${unread.length}`}
                  noPadding
                >
                  <div className="divide-y">{unread.map(row)}</div>
                </SectionCard>
              )}
              {actionableCount > 0 && (
                <SectionCard
                  title="Ce qui t'attend"
                  description={`${actionableCount} élément(s)`}
                  noPadding
                >
                  <ul className="divide-y">
                    {actionables.questions.map((q) => (
                      <ActionRow
                        key={q.id}
                        icon={MessagesSquare}
                        label="Question à répondre"
                        text={q.body}
                        href="/questions"
                      />
                    ))}
                    {actionables.tasks.map((t) => (
                      <ActionRow
                        key={t.id}
                        icon={ListChecks}
                        label="Tâche à faire"
                        text={t.title}
                        href="/taches"
                      />
                    ))}
                    {actionables.decisions.map((d) => (
                      <ActionRow
                        key={d.id}
                        icon={Gavel}
                        label="Décision à valider"
                        text={d.title}
                        href="/decisions"
                      />
                    ))}
                    {actionables.accesses.map((a) => (
                      <ActionRow
                        key={a.id}
                        icon={KeyRound}
                        label="Accès à fournir"
                        text={a.name}
                        href="/acces"
                      />
                    ))}
                  </ul>
                </SectionCard>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="read" className="mt-4">
          <SectionCard title="Mentions lues" noPadding>
            {read.length === 0 ? (
              <div className="p-5">
                <EmptyState icon={Bell} title="Aucune mention lue" />
              </div>
            ) : (
              <div className="divide-y">{read.map(row)}</div>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ActionRow({
  icon: Icon,
  label,
  text,
  href,
}: {
  icon: LucideIcon;
  label: string;
  text: string;
  href: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{label}</span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {text}
          </span>
        </span>
      </Link>
    </li>
  );
}
