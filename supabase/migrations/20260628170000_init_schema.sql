-- ============================================================
-- Skalesy Cockpit — schema
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Enums ----------
create type user_role as enum ('skalesy_admin', 'client', 'provider', 'pending');
create type provider_domain as enum ('dev', 'design', 'branding', 'paid_acquisition', 'seo');
create type owner_side as enum ('skalesy', 'client', 'provider');
create type task_status as enum ('todo', 'waiting', 'blocked', 'in_progress', 'done');
create type priority as enum ('low', 'medium', 'high', 'urgent');
create type question_status as enum ('open', 'answered', 'closed');
create type decision_status as enum ('proposed', 'validated', 'rejected');
create type blocker_status as enum ('open', 'resolved');
create type access_status as enum ('needed', 'requested', 'provided', 'confirmed');
create type roadmap_status as enum ('planned', 'in_progress', 'done');

-- ---------- updated_at helper ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- projects ----------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text,
  description text,
  objectives jsonb not null default '[]'::jsonb,
  status text not null default 'active',
  progress int not null default 0 check (progress between 0 and 100),
  start_date date,
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- profiles (extends auth.users) ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role user_role not null default 'pending',
  provider_domain provider_domain,
  company text,
  title text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- allowed_members (access control list) ----------
create table public.allowed_members (
  email text primary key,
  role user_role not null,
  provider_domain provider_domain,
  full_name text,
  created_at timestamptz not null default now()
);

-- ---------- provider_workspaces ----------
create table public.provider_workspaces (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  domain provider_domain not null,
  lead_profile_id uuid references public.profiles(id) on delete set null,
  summary text,
  needs text,
  recommendations text,
  progress int not null default 0 check (progress between 0 and 100),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, domain)
);

-- ---------- tasks ----------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status task_status not null default 'todo',
  priority priority not null default 'medium',
  domain provider_domain,
  owner_side owner_side not null default 'provider',
  assignee_profile_id uuid references public.profiles(id) on delete set null,
  due_date date,
  sort_order int not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- questions ----------
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  body text not null,
  answer text,
  domain provider_domain,
  directed_to owner_side not null default 'client',
  status question_status not null default 'open',
  priority priority not null default 'medium',
  asked_by uuid references public.profiles(id) on delete set null,
  answered_by uuid references public.profiles(id) on delete set null,
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- blockers ----------
create table public.blockers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  domain provider_domain,
  severity priority not null default 'high',
  status blocker_status not null default 'open',
  raised_by uuid references public.profiles(id) on delete set null,
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- decisions ----------
create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  context text,
  decision text,
  domain provider_domain,
  status decision_status not null default 'proposed',
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- accesses ----------
create table public.accesses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  description text,
  domain provider_domain,
  provided_by owner_side not null default 'client',
  status access_status not null default 'needed',
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- documents ----------
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  category text,
  url text,
  storage_path text,
  domain provider_domain,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- roadmap_items ----------
create table public.roadmap_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  phase text,
  domain provider_domain,
  status roadmap_status not null default 'planned',
  start_date date,
  end_date date,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- activity_log ----------
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  actor_name text,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

-- ---------- updated_at triggers ----------
create trigger trg_projects_updated before update on public.projects
  for each row execute function public.set_updated_at();
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_workspaces_updated before update on public.provider_workspaces
  for each row execute function public.set_updated_at();
create trigger trg_tasks_updated before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger trg_questions_updated before update on public.questions
  for each row execute function public.set_updated_at();
create trigger trg_blockers_updated before update on public.blockers
  for each row execute function public.set_updated_at();
create trigger trg_decisions_updated before update on public.decisions
  for each row execute function public.set_updated_at();
create trigger trg_accesses_updated before update on public.accesses
  for each row execute function public.set_updated_at();
create trigger trg_roadmap_updated before update on public.roadmap_items
  for each row execute function public.set_updated_at();

-- ---------- indexes ----------
create index idx_workspaces_project on public.provider_workspaces (project_id, sort_order);
create index idx_tasks_project_status on public.tasks (project_id, status);
create index idx_tasks_project_domain on public.tasks (project_id, domain);
create index idx_tasks_owner on public.tasks (project_id, owner_side);
create index idx_questions_project_status on public.questions (project_id, status);
create index idx_blockers_project_status on public.blockers (project_id, status);
create index idx_decisions_project_status on public.decisions (project_id, status);
create index idx_accesses_project_status on public.accesses (project_id, status);
create index idx_documents_project on public.documents (project_id);
create index idx_roadmap_project on public.roadmap_items (project_id, sort_order);
create index idx_activity_project_created on public.activity_log (project_id, created_at desc);
