-- ============================================================
-- Notifications : @mentions adressées à un membre (état lu/non-lu).
-- Les éléments « qui me sont adressés » (questions, tâches, décisions,
-- accès) ne sont PAS stockés ici : ils sont calculés en direct depuis
-- leur statut. Seules les mentions sont des événements persistés.
-- ============================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  actor_name text,
  entity_type text not null,   -- 'question' | 'decision' | 'blocker'
  entity_id uuid not null,
  preview text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_recipient_idx
  on public.notifications (recipient_id, read_at, created_at desc);

alter table public.notifications enable row level security;

-- On ne voit que SES propres notifications.
create policy "notifications_select" on public.notifications
  for select to authenticated using (recipient_id = auth.uid());

-- Un membre crée des notifications (il en est l'auteur) pour les personnes taguées.
create policy "notifications_insert" on public.notifications
  for insert to authenticated
  with check (public.is_member() and actor_id = auth.uid());

-- Marquer comme lu = mise à jour de SA propre notification.
create policy "notifications_update" on public.notifications
  for update to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

create policy "notifications_delete" on public.notifications
  for delete to authenticated
  using (recipient_id = auth.uid() or public.is_admin());
