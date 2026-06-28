import { PageHeader } from "@/components/app/page-header";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble du projet : avancement, ce qui est en attente et qui doit faire quoi."
      />
      <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">
        Le tableau de bord complet (KPIs, activité récente, actions en attente)
        arrive au Jalon&nbsp;2.
      </div>
    </div>
  );
}
