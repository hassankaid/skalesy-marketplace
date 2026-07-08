-- ============================================================
-- Attachments : documents joints aux réponses (questions) et aux décisions.
-- Réutilise le bucket privé `project-docs` (déjà créé, jusqu'ici inutilisé
-- pour de vrais uploads). Un attachment = soit un fichier stocké
-- (storage_path), soit un lien externe (url).
-- ============================================================

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  entity_type text not null check (entity_type in ('question', 'decision')),
  entity_id uuid not null,
  name text not null,
  url text,
  storage_path text,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint attachments_url_or_path check (url is not null or storage_path is not null)
);

create index if not exists attachments_entity_idx
  on public.attachments (project_id, entity_type, entity_id, created_at);

alter table public.attachments enable row level security;

-- Tout membre du projet peut consulter les pièces jointes.
create policy "attachments_select" on public.attachments
  for select to authenticated using (public.is_member());

-- Tout membre peut joindre un document (il en devient propriétaire).
-- (Le gating fin — qui peut répondre / décider — reste côté UI ; la RLS
-- garantit surtout qu'un non-membre ne peut rien joindre.)
create policy "attachments_insert" on public.attachments
  for insert to authenticated
  with check (public.is_member() and uploaded_by = auth.uid());

-- Suppression réservée à l'admin ou à l'auteur du dépôt.
create policy "attachments_delete" on public.attachments
  for delete to authenticated
  using (public.is_admin() or uploaded_by = auth.uid());
