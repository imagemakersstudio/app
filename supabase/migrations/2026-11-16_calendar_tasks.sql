-- =====================================================================
--  Tasks στο ημερολόγιο (ίδιος πίνακας με το «Άλλο»)
--  · kind: 'note' (Άλλο, όπως πριν) ή 'task'
--  · assignee_id: για ποιο άτομο είναι το task — το βλέπει πάντα, ακόμη κι αν είναι «μόνο διαχειριστές»
--  · done_at / done_by: ολοκλήρωση (από διαχειριστή ή από το ίδιο το άτομο)
-- =====================================================================
alter table public.calendar_notes
  add column if not exists kind text not null default 'note',
  add column if not exists assignee_id uuid references public.profiles(id) on delete set null,
  add column if not exists done_at timestamptz,
  add column if not exists done_by uuid references public.profiles(id) on delete set null;
alter table public.calendar_notes drop constraint if exists calendar_notes_kind_check;
alter table public.calendar_notes add constraint calendar_notes_kind_check check (kind in ('note', 'task'));
create index if not exists calendar_notes_assignee_idx on public.calendar_notes(assignee_id) where assignee_id is not null;

-- ποιος το βλέπει: διαχειριστές · όλη η ομάδα αν είναι «ορατό σε όλους» · και το άτομο του task
drop policy if exists calendar_notes_select on public.calendar_notes;
create policy calendar_notes_select on public.calendar_notes for select to authenticated
  using (is_admin() or (team_visible and has_role()) or assignee_id = auth.uid());

-- «Ολοκληρώθηκε»: ο διαχειριστής ή το άτομο του task (μόνο αυτό το πεδίο αλλάζει)
create or replace function public.task_set_done(p_id uuid, p_done boolean) returns public.calendar_notes
language plpgsql security definer set search_path = public, private as $$
declare r public.calendar_notes;
begin
  update public.calendar_notes
     set done_at = case when p_done then coalesce(done_at, now()) else null end,
         done_by = case when p_done then coalesce(done_by, auth.uid()) else null end
   where id = p_id and kind = 'task' and (is_admin() or assignee_id = auth.uid())
  returning * into r;
  if not found then raise exception 'not_allowed'; end if;
  return r;
end $$;
revoke all on function public.task_set_done(uuid, boolean) from public, anon;
grant execute on function public.task_set_done(uuid, boolean) to authenticated;

-- ειδοποιήσεις: στο άτομο όταν του ανατίθεται task · στον δημιουργό όταν το άτομο το ολοκληρώνει
create or replace function private.calendar_task_after() returns trigger
language plpgsql security definer set search_path = public, private as $$
declare v_line text;
begin
  if new.kind <> 'task' then return new; end if;
  v_line := concat_ws(' · ', new.title, private.fmt_date(new.day), to_char(new.start_time, 'HH24:MI'), nullif(trim(new.location), ''));
  if new.assignee_id is not null and new.assignee_id is distinct from auth.uid()
     and (tg_op = 'INSERT' or new.assignee_id is distinct from old.assignee_id)
     and new.day >= (now() at time zone 'Europe/Athens')::date then
    insert into public.notifications(user_id, kind, title, body, link)
    select pr.id, 'task', private.tr(pr.lang, 'Νέο task για εσάς', 'New task for you'), v_line, '#/calendar'
      from public.profiles pr where pr.id = new.assignee_id and pr.active;
  end if;
  if tg_op = 'UPDATE' and new.done_at is not null and old.done_at is null
     and new.created_by is not null and new.created_by is distinct from auth.uid() then
    insert into public.notifications(user_id, kind, title, body, link)
    select pr.id, 'task', private.tr(pr.lang, 'Ολοκληρώθηκε task', 'Task completed'),
           v_line || coalesce(' · ' || (select coalesce(nullif(full_name, ''), username) from public.profiles where id = new.done_by), ''), '#/calendar'
      from public.profiles pr where pr.id = new.created_by and pr.active;
  end if;
  return new;
end $$;
drop trigger if exists calendar_task_after on public.calendar_notes;
create trigger calendar_task_after after insert or update on public.calendar_notes
  for each row execute function private.calendar_task_after();
