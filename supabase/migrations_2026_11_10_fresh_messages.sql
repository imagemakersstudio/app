-- =====================================================================
-- 2026-11-10 · Μηνύματα προς πελάτες: πάντα με τα τρέχοντα στοιχεία
--   Τα μηνύματα «Προς αποστολή» ξαναγράφονται αυτόματα όταν αλλάζουν
--   τα στοιχεία του πελάτη, της εκδήλωσης, του πακέτου ή οι πληρωμές.
--   Μήνυμα που άλλαξε κάποιος με το χέρι (edited) δεν αγγίζεται.
-- =====================================================================
alter table public.message_queue add column if not exists edited boolean not null default false;

create or replace function private.refresh_pending_messages(p_event uuid, p_id uuid default null)
returns integer language plpgsql security definer set search_path = public, private as $$
declare n integer;
begin
  update public.message_queue m
     set body     = private.render_message(t.body, m.event_id, m.payment_id, t.threshold_pct),
         subject  = private.render_message(t.subject, m.event_id, m.payment_id, t.threshold_pct),
         to_phone = coalesce(nullif(c.phone1, ''), nullif(c.phone2, '')),
         to_email = coalesce(nullif(c.email1, ''), nullif(c.email2, ''))
    from public.message_templates t, public.events e
    left join public.customers c on c.id = e.customer_id
   where t.id = m.template_id
     and e.id = m.event_id
     and m.status = 'pending'
     and not m.edited
     and (p_event is null or m.event_id = p_event)
     and (p_id is null or m.id = p_id);
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function private.refresh_pending_messages(uuid, uuid) from public, anon, authenticated;

-- Ανανέωση ενός μηνύματος τη στιγμή που ανοίγει (π.χ. υπόλοιπο, ημέρες που απομένουν)
create or replace function public.refresh_message(p_id uuid)
returns public.message_queue language plpgsql security definer set search_path = public, private as $$
declare r public.message_queue;
begin
  if not public.is_admin() then raise exception 'not_allowed'; end if;
  perform private.refresh_pending_messages(null, p_id);
  select * into r from public.message_queue where id = p_id;
  return r;
end $$;
revoke all on function public.refresh_message(uuid) from public, anon;
grant execute on function public.refresh_message(uuid) to authenticated;

-- Αλλαγή πελάτη → όλες οι εκδηλώσεις του
create or replace function private.msg_refresh_customer() returns trigger
language plpgsql security definer set search_path = public, private as $$
declare ev uuid;
begin
  if private.restore_active() then return null; end if;
  if (new.name1, new.name2, new.phone1, new.phone2, new.email1, new.email2)
     is distinct from (old.name1, old.name2, old.phone1, old.phone2, old.email1, old.email2) then
    for ev in select id from public.events where customer_id = new.id loop
      perform private.refresh_pending_messages(ev);
    end loop;
  end if;
  return null;
end $$;
drop trigger if exists customers_msg_refresh on public.customers;
create trigger customers_msg_refresh after update on public.customers
  for each row execute function private.msg_refresh_customer();

-- Αλλαγή εκδήλωσης (ημερομηνία, ώρα, τοποθεσίες, τύπος, πελάτης)
create or replace function private.msg_refresh_event() returns trigger
language plpgsql security definer set search_path = public, private as $$
begin
  if private.restore_active() then return null; end if;
  if (new.customer_id, new.event_date, new.event_time, new.category, new.church_location,
      new.reception_location, new.bride_house, new.groom_house, new.house_location)
     is distinct from
     (old.customer_id, old.event_date, old.event_time, old.category, old.church_location,
      old.reception_location, old.bride_house, old.groom_house, old.house_location) then
    perform private.refresh_pending_messages(new.id);
  end if;
  return null;
end $$;
drop trigger if exists events_msg_refresh on public.events;
create trigger events_msg_refresh after update on public.events
  for each row execute function private.msg_refresh_event();

-- Τιμή πακέτου / πληρωμές → ποσά στα μηνύματα
create or replace function private.msg_refresh_money() returns trigger
language plpgsql security definer set search_path = public, private as $$
begin
  if private.restore_active() then return null; end if;
  if tg_op in ('UPDATE', 'DELETE') and old.event_id is not null then
    perform private.refresh_pending_messages(old.event_id);
  end if;
  if tg_op in ('INSERT', 'UPDATE') and new.event_id is not null
     and (tg_op = 'INSERT' or new.event_id is distinct from old.event_id) then
    perform private.refresh_pending_messages(new.event_id);
  end if;
  return null;
end $$;
drop trigger if exists event_finance_msg_refresh on public.event_finance;
create trigger event_finance_msg_refresh after insert or update on public.event_finance
  for each row execute function private.msg_refresh_money();
drop trigger if exists payments_msg_refresh on public.payments;
create trigger payments_msg_refresh after insert or update or delete on public.payments
  for each row execute function private.msg_refresh_money();

-- Επιδιόρθωση όσων περιμένουν ήδη με παλιά στοιχεία
select private.refresh_pending_messages(null);

-- Ειδοποίηση ενημέρωσης στους διαχειριστές
select private.notify_admins('update', 'Νέα έκδοση 1.9.5', 'New version 1.9.5',
  'Διορθώσεις σφαλμάτων και βελτιώσεις. Ανοίξτε ξανά την εφαρμογή για να ενημερωθεί.',
  'Bug fixes and improvements. Reopen the app to update.', '#/home');
