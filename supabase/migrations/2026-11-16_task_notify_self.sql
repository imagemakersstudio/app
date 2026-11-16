-- =====================================================================
--  Tasks: ειδοποίηση στο άτομο ΠΑΝΤΑ (και όταν το task είναι για τον εαυτό σας)
--  · τίτλος «📋 Νέο task» · κείμενο: τίτλος · ημερομηνία · ώρα · τοποθεσία · από ποιον
-- =====================================================================
create or replace function private.calendar_task_after() returns trigger
language plpgsql security definer set search_path = public, private as $$
declare v_line text; v_by text;
begin
  if new.kind <> 'task' then return new; end if;
  v_line := concat_ws(' · ', new.title, private.fmt_date(new.day), to_char(new.start_time, 'HH24:MI'), nullif(trim(new.location), ''));
  if new.assignee_id is not null
     and (tg_op = 'INSERT' or new.assignee_id is distinct from old.assignee_id)
     and new.day >= (now() at time zone 'Europe/Athens')::date then
    select coalesce(nullif(full_name, ''), username) into v_by from public.profiles where id = new.created_by;
    insert into public.notifications(user_id, kind, title, body, link)
    select pr.id, 'task', private.tr(pr.lang, '📋 Νέο task για εσάς', '📋 New task for you'),
           v_line || case when v_by is not null and new.created_by is distinct from new.assignee_id
                          then ' · ' || private.tr(pr.lang, 'από ', 'from ') || v_by else '' end,
           '#/calendar'
      from public.profiles pr where pr.id = new.assignee_id and pr.active;
  end if;
  if tg_op = 'UPDATE' and new.done_at is not null and old.done_at is null
     and new.created_by is not null and new.created_by is distinct from auth.uid() then
    insert into public.notifications(user_id, kind, title, body, link)
    select pr.id, 'task', private.tr(pr.lang, '✅ Ολοκληρώθηκε task', '✅ Task completed'),
           v_line || coalesce(' · ' || (select coalesce(nullif(full_name, ''), username) from public.profiles where id = new.done_by), ''), '#/calendar'
      from public.profiles pr where pr.id = new.created_by and pr.active;
  end if;
  return new;
end $$;
