-- Σελίδες πελάτη ανά τύπο (γάμος / βάπτιση / γαμοβάπτιση):
-- το ηλεκτρονικό ραντεβού παίρνει τον τύπο από τις επιλογές (selections.category).
-- Χωρίς τύπο ή με άγνωστη τιμή → «Γάμος», όπως μέχρι σήμερα.
create or replace function private.after_offer_request() returns trigger
language plpgsql security definer set search_path = public, private as $$
declare
  v_cat text := coalesce(new.selections->>'category', 'wedding');
  v_lbl text;
begin
  if v_cat not in ('wedding', 'baptism', 'wedding_baptism') then v_cat := 'wedding'; end if;
  v_lbl := case v_cat when 'baptism' then 'Βάπτιση' when 'wedding_baptism' then 'Γαμοβάπτιση' else 'Γάμος' end;
  insert into public.appointments(mode, appt_date, category, name1, name2, phone, email, event_date,
                                  church, church_time, reception, reception_time, selections, total, request_id, status_at)
  values ('online', (new.created_at at time zone 'Europe/Athens')::date, v_cat, new.partner1, new.partner2,
          coalesce(nullif(new.phone1, ''), new.phone2), new.email, new.wedding_date,
          new.church, new.church_time, new.reception, new.reception_time, new.selections, new.client_total, new.id, new.created_at);
  perform private.notify_admins('request',
    'Νέα ηλεκτρονική προσφορά', 'New online offer',
    v_lbl || ' · ' || concat_ws(' & ', nullif(new.partner1, ''), nullif(new.partner2, '')) || ' · ' || private.fmt_date(new.wedding_date),
    v_lbl || ' · ' || concat_ws(' & ', nullif(new.partner1, ''), nullif(new.partner2, '')) || ' · ' || private.fmt_date(new.wedding_date),
    '#/appointments');
  return new;
end $$;
