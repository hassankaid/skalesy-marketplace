-- ============================================================
-- Row Level Security
-- ============================================================

-- ---------- Helper functions (security definer → no RLS recursion) ----------
create or replace function public.current_app_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_app_domain()
returns provider_domain language sql stable security definer set search_path = public as $$
  select provider_domain from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'skalesy_admin'
  );
$$;

create or replace function public.is_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('skalesy_admin', 'client', 'provider')
  );
$$;

-- ---------- Enable RLS ----------
alter table public.projects enable row level security;
alter table public.profiles enable row level security;
alter table public.allowed_members enable row level security;
alter table public.provider_workspaces enable row level security;
alter table public.tasks enable row level security;
alter table public.questions enable row level security;
alter table public.blockers enable row level security;
alter table public.decisions enable row level security;
alter table public.accesses enable row level security;
alter table public.documents enable row level security;
alter table public.roadmap_items enable row level security;
alter table public.activity_log enable row level security;

-- ---------- profiles ----------
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_member());
create policy "profiles_update" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
create policy "profiles_delete" on public.profiles
  for delete to authenticated
  using (public.is_admin());

-- ---------- projects ----------
create policy "projects_select" on public.projects
  for select to authenticated using (public.is_member());
create policy "projects_insert" on public.projects
  for insert to authenticated with check (public.is_admin());
create policy "projects_update" on public.projects
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "projects_delete" on public.projects
  for delete to authenticated using (public.is_admin());

-- ---------- allowed_members (admin only) ----------
create policy "allowed_select" on public.allowed_members
  for select to authenticated using (public.is_admin());
create policy "allowed_insert" on public.allowed_members
  for insert to authenticated with check (public.is_admin());
create policy "allowed_update" on public.allowed_members
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "allowed_delete" on public.allowed_members
  for delete to authenticated using (public.is_admin());

-- ---------- provider_workspaces ----------
create policy "workspaces_select" on public.provider_workspaces
  for select to authenticated using (public.is_member());
create policy "workspaces_insert" on public.provider_workspaces
  for insert to authenticated
  with check (public.is_admin() or (public.current_app_role() = 'provider' and domain = public.current_app_domain()));
create policy "workspaces_update" on public.provider_workspaces
  for update to authenticated
  using (public.is_admin() or (public.current_app_role() = 'provider' and domain = public.current_app_domain()))
  with check (public.is_admin() or (public.current_app_role() = 'provider' and domain = public.current_app_domain()));
create policy "workspaces_delete" on public.provider_workspaces
  for delete to authenticated using (public.is_admin());

-- ---------- tasks ----------
create policy "tasks_select" on public.tasks
  for select to authenticated using (public.is_member());
create policy "tasks_insert" on public.tasks
  for insert to authenticated
  with check (public.is_admin() or (public.current_app_role() = 'provider' and domain = public.current_app_domain()));
create policy "tasks_update" on public.tasks
  for update to authenticated
  using (
    public.is_admin()
    or (public.current_app_role() = 'provider' and domain = public.current_app_domain())
    or (public.current_app_role() = 'client' and owner_side = 'client')
  )
  with check (
    public.is_admin()
    or (public.current_app_role() = 'provider' and domain = public.current_app_domain())
    or (public.current_app_role() = 'client' and owner_side = 'client')
  );
create policy "tasks_delete" on public.tasks
  for delete to authenticated
  using (public.is_admin() or (public.current_app_role() = 'provider' and domain = public.current_app_domain()));

-- ---------- questions ----------
create policy "questions_select" on public.questions
  for select to authenticated using (public.is_member());
create policy "questions_insert" on public.questions
  for insert to authenticated
  with check (public.is_admin() or (public.current_app_role() = 'provider' and domain = public.current_app_domain()));
create policy "questions_update" on public.questions
  for update to authenticated
  using (
    public.is_admin()
    or (public.current_app_role() = 'provider' and domain = public.current_app_domain())
    or (public.current_app_role() = 'client' and directed_to = 'client')
  )
  with check (
    public.is_admin()
    or (public.current_app_role() = 'provider' and domain = public.current_app_domain())
    or (public.current_app_role() = 'client' and directed_to = 'client')
  );
create policy "questions_delete" on public.questions
  for delete to authenticated
  using (public.is_admin() or (public.current_app_role() = 'provider' and domain = public.current_app_domain()));

-- ---------- blockers ----------
create policy "blockers_select" on public.blockers
  for select to authenticated using (public.is_member());
create policy "blockers_insert" on public.blockers
  for insert to authenticated
  with check (public.is_admin() or (public.current_app_role() = 'provider' and domain = public.current_app_domain()));
create policy "blockers_update" on public.blockers
  for update to authenticated
  using (public.is_admin() or (public.current_app_role() = 'provider' and domain = public.current_app_domain()))
  with check (public.is_admin() or (public.current_app_role() = 'provider' and domain = public.current_app_domain()));
create policy "blockers_delete" on public.blockers
  for delete to authenticated
  using (public.is_admin() or (public.current_app_role() = 'provider' and domain = public.current_app_domain()));

-- ---------- decisions ----------
create policy "decisions_select" on public.decisions
  for select to authenticated using (public.is_member());
create policy "decisions_insert" on public.decisions
  for insert to authenticated with check (public.is_admin());
create policy "decisions_update" on public.decisions
  for update to authenticated
  using (public.is_admin() or public.current_app_role() = 'client')
  with check (public.is_admin() or public.current_app_role() = 'client');
create policy "decisions_delete" on public.decisions
  for delete to authenticated using (public.is_admin());

-- ---------- accesses ----------
create policy "accesses_select" on public.accesses
  for select to authenticated using (public.is_member());
create policy "accesses_insert" on public.accesses
  for insert to authenticated
  with check (public.is_admin() or (public.current_app_role() = 'provider' and domain = public.current_app_domain()));
create policy "accesses_update" on public.accesses
  for update to authenticated
  using (
    public.is_admin()
    or (public.current_app_role() = 'provider' and domain = public.current_app_domain())
    or public.current_app_role() = 'client'
  )
  with check (
    public.is_admin()
    or (public.current_app_role() = 'provider' and domain = public.current_app_domain())
    or public.current_app_role() = 'client'
  );
create policy "accesses_delete" on public.accesses
  for delete to authenticated using (public.is_admin());

-- ---------- documents ----------
create policy "documents_select" on public.documents
  for select to authenticated using (public.is_member());
create policy "documents_insert" on public.documents
  for insert to authenticated
  with check (public.is_member() and uploaded_by = auth.uid());
create policy "documents_update" on public.documents
  for update to authenticated
  using (public.is_admin() or uploaded_by = auth.uid())
  with check (public.is_admin() or uploaded_by = auth.uid());
create policy "documents_delete" on public.documents
  for delete to authenticated
  using (public.is_admin() or uploaded_by = auth.uid());

-- ---------- roadmap_items (Skalesy owns the roadmap) ----------
create policy "roadmap_select" on public.roadmap_items
  for select to authenticated using (public.is_member());
create policy "roadmap_insert" on public.roadmap_items
  for insert to authenticated with check (public.is_admin());
create policy "roadmap_update" on public.roadmap_items
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "roadmap_delete" on public.roadmap_items
  for delete to authenticated using (public.is_admin());

-- ---------- activity_log (append-only) ----------
create policy "activity_select" on public.activity_log
  for select to authenticated using (public.is_member());
create policy "activity_insert" on public.activity_log
  for insert to authenticated
  with check (public.is_member() and (actor_profile_id = auth.uid() or actor_profile_id is null));
