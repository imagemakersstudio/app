-- =====================================================================
--  Προσωπικό link προσφοράς για ραντεβού στο μαγαζί
--  · Ο πελάτης ανοίγει τη σελίδα προσφοράς συμπληρωμένη με όσα επιλέχθηκαν στο μαγαζί
--  · Αν αλλάξει επιλογές και πατήσει «Αποστολή», ενημερώνεται το ΙΔΙΟ ραντεβού
--  · Ο πελάτης βλέπει μόνο το δικό του ραντεβού (τυχαίος κωδικός), το link λήγει
--    και κλειδώνει όταν το ραντεβού δεν είναι πια «σε αναμονή»
-- =====================================================================
alter table public.appointments
  add column if not exists share_token text,
  add column if not exists share_expires_at timestamptz,
  add column if not exists client_selections jsonb,  -- οι τελευταίες επιλογές του πελάτη (από το link)
  add column if not exists client_total numeric,     -- η τιμή που είδε ο πελάτης
  add column if not exists client_changed_at timestamptz,
  add column if not exists client_applied_at timestamptz, -- πότε πέρασαν στην προσφορά/PDF από την εφαρμογή
  add column if not exists client_prev jsonb,        -- η προσφορά του μαγαζιού πριν την πρώτη αλλαγή (για «Επαναφορά»)
  add column if not exists client_edits int not null default 0;

create unique index if not exists appointments_share_token_key on public.appointments(share_token) where share_token is not null;

alter table public.appointments drop constraint if exists appointments_share_sizes;
alter table public.appointments add constraint appointments_share_sizes
  check (coalesce(length(share_token), 0) <= 64 and coalesce(length(client_selections::text), 0) <= 8000);

-- Τι βλέπει ο πελάτης: μόνο ό,τι χρειάζεται η σελίδα (χωρίς σημειώσεις, μεταφορικά, χειροκίνητη τιμή)
create or replace function public.offer_by_token(p_token text) returns jsonb
language sql stable security definer set search_path = public, private as $$
  select jsonb_build_object(
    'kind', a.category,
    'name1', a.name1, 'name2', a.name2, 'phone', a.phone, 'email', a.email,
    'event_date', a.event_date, 'church', a.church, 'church_time', a.church_time,
    'reception', a.reception, 'reception_time', a.reception_time,
    'offer', case when a.client_selections is null then
               jsonb_strip_nulls(jsonb_build_object(
                 'removes', a.offer_data->'removes', 'adds', a.offer_data->'adds',
                 'smallAlbumCount', a.offer_data->'smallAlbumCount', 'removeAlbums', a.offer_data->'removeAlbums',
                 'smallAlbums', a.offer_data->'smallAlbums', 'extraHours', a.offer_data->'extraHours',
                 'largeSpreads', a.offer_data->'largeSpreads', 'smallSpreads', a.offer_data->'smallSpreads',
                 'prints', a.offer_data->'prints')) end,
    'client', a.client_selections,
    'total', case when a.client_selections is not null and a.client_changed_at > coalesce(a.client_applied_at, '-infinity')
                  then a.client_total else a.total end,
    'locked', (a.status <> 'pending' or a.event_id is not null),
    'expires_at', a.share_expires_at)
  from public.appointments a
  where p_token is not null and length(p_token) between 20 and 64
    and a.share_token = p_token and a.share_expires_at > now()
    and a.name1 is distinct from '—' and (a.offer_data is not null or a.client_selections is not null)
$$;

-- Ο πελάτης στέλνει τις νέες του επιλογές: ενημερώνεται το ίδιο ραντεβού
create or replace function public.offer_update_by_token(p_token text, p_selections jsonb, p_total numeric) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare a public.appointments;
begin
  if p_token is null or length(p_token) not between 20 and 64 then raise exception 'link_invalid'; end if;
  select * into a from public.appointments where share_token = p_token for update;
  if not found or a.share_expires_at <= now() or a.name1 = '—' then raise exception 'link_invalid'; end if;
  if a.status <> 'pending' or a.event_id is not null then raise exception 'locked'; end if;
  if a.client_edits >= 30 then raise exception 'too_many'; end if;
  if a.client_changed_at > now() - interval '10 seconds' then raise exception 'too_fast'; end if;
  if p_selections is null or jsonb_typeof(p_selections) <> 'object' or length(p_selections::text) > 8000 then raise exception 'too_large'; end if;
  if p_total is null or p_total < 0 or p_total > 100000 then raise exception 'bad_total'; end if;
  update public.appointments
     set client_prev = coalesce(client_prev, jsonb_build_object('offer_data', offer_data, 'total', total)),
         client_selections = (p_selections - 'category') || jsonb_build_object('category', category),
         client_total = round(p_total),
         client_changed_at = now(),
         client_edits = client_edits + 1,
         status_at = now()  -- ο πελάτης απάντησε: μηδενίζει τη μέτρηση «χωρίς απάντηση»
   where id = a.id;
  perform private.notify_admins('request',
    'Ο πελάτης άλλαξε επιλογές', 'Client changed their choices',
    concat_ws(' & ', nullif(a.name1, ''), nullif(a.name2, '')) || ' · ' || round(p_total)::text || '€',
    concat_ws(' & ', nullif(a.name1, ''), nullif(a.name2, '')) || ' · ' || round(p_total)::text || '€',
    '#/appointments');
  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.offer_by_token(text) from public;
revoke all on function public.offer_update_by_token(text, jsonb, numeric) from public;
grant execute on function public.offer_by_token(text) to anon, authenticated;
grant execute on function public.offer_update_by_token(text, jsonb, numeric) to anon, authenticated;

-- Ιδιωτικότητα: η ανωνυμοποίηση μετά από 12 μήνες σβήνει και το link / τις επιλογές του πελάτη
create or replace function private.retention_cleanup() returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare n_ap int := 0; n_req int := 0; n_not int := 0; cutoff date := (now() at time zone 'Europe/Athens')::date - interval '12 months';
begin
  -- ραντεβού που δεν έγιναν εκδήλωση: ανωνυμοποίηση (μένουν μόνο ανώνυμα στοιχεία για στατιστικά)
  insert into private.storage_trash(path)
    select offer_path from public.appointments
     where event_id is null and offer_path is not null and name1 is distinct from '—'
       and status in ('pending','scheduled','rejected')
       and greatest(appt_date, coalesce(event_date, appt_date)) < cutoff
  on conflict do nothing;
  update public.appointments set name1 = '—', name2 = null, phone = null, email = null, church = null, church_time = null,
         reception = null, reception_time = null, notes = null, comments = null, selections = null, offer_data = null,
         offer_path = null, customer_id = null,
         share_token = null, share_expires_at = null, client_selections = null, client_prev = null
   where event_id is null and name1 is distinct from '—'
     and status in ('pending','scheduled','rejected')
     and greatest(appt_date, coalesce(event_date, appt_date)) < cutoff;
  get diagnostics n_ap = row_count;
  -- ακατέργαστα αιτήματα της σελίδας προσφοράς που δεν έγιναν εκδήλωση
  delete from public.offer_requests where event_id is null and created_at < now() - interval '12 months';
  get diagnostics n_req = row_count;
  -- ειδοποιήσεις μέσα στην εφαρμογή
  delete from public.notifications where created_at < now() - interval '12 months';
  get diagnostics n_not = row_count;
  if n_ap + n_req + n_not > 0 then
    perform private.log('retention_cleanup', 'privacy', null, jsonb_build_object('appointments', n_ap, 'requests', n_req, 'notifications', n_not));
  end if;
  return jsonb_build_object('appointments', n_ap, 'requests', n_req, 'notifications', n_not);
end $$;
