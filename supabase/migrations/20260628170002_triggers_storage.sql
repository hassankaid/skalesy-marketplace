-- ============================================================
-- Auth triggers + Storage
-- ============================================================

-- ---------- Create a profile on signup, role/domain from allowed_members ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  m public.allowed_members%rowtype;
begin
  select * into m from public.allowed_members where lower(email) = lower(new.email);

  insert into public.profiles (id, email, full_name, role, provider_domain)
  values (
    new.id,
    new.email,
    coalesce(m.full_name, new.raw_user_meta_data ->> 'full_name'),
    coalesce(m.role, 'pending'),
    m.provider_domain
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Prevent non-admins from changing their own role/domain ----------
create or replace function public.enforce_profile_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then
    return new;
  end if;
  new.role := old.role;
  new.provider_domain := old.provider_domain;
  return new;
end;
$$;

create trigger trg_profiles_guard
  before update on public.profiles
  for each row execute function public.enforce_profile_guard();

-- ---------- Storage bucket for documents (private) ----------
insert into storage.buckets (id, name, public)
values ('project-docs', 'project-docs', false)
on conflict (id) do nothing;

create policy "project_docs_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'project-docs' and public.is_member());

create policy "project_docs_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'project-docs' and public.is_member());

create policy "project_docs_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'project-docs' and public.is_member());

create policy "project_docs_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'project-docs' and (public.is_admin() or owner = auth.uid()));
