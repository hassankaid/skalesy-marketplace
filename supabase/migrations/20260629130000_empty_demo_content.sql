-- ============================================================
-- Empty all demo content so the admin configures the project
-- from a blank slate. Keeps accounts (allowed_members / auth),
-- the single project row and the 5 provider workspace rows
-- (their text is blanked; the admin fills them in via the UI).
-- ============================================================
do $$
declare
  pid uuid := '11111111-1111-1111-1111-111111111111';
begin
  if not exists (select 1 from public.projects where id = pid) then
    return;
  end if;

  delete from public.tasks where project_id = pid;
  delete from public.questions where project_id = pid;
  delete from public.blockers where project_id = pid;
  delete from public.decisions where project_id = pid;
  delete from public.accesses where project_id = pid;
  delete from public.documents where project_id = pid;
  delete from public.roadmap_items where project_id = pid;
  delete from public.activity_log where project_id = pid;

  update public.projects set
    client_name = null,
    description = null,
    objectives = '[]'::jsonb,
    progress = 0,
    start_date = null,
    target_date = null
  where id = pid;

  update public.provider_workspaces set
    summary = null,
    needs = null,
    recommendations = null,
    progress = 0
  where project_id = pid;
end $$;
