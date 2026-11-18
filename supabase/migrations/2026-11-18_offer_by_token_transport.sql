-- Σελίδα πελάτη (νέα παρουσίαση): το προσωπικό link επιστρέφει και τα μεταφορικά,
-- ώστε να φαίνονται σταθερά στην πρόταση και η έκπτωση να υπολογίζεται σωστά.
create or replace function public.offer_by_token(p_token text) returns jsonb
language sql stable security definer set search_path = public, private as $$
  select jsonb_build_object(
    'kind', a.category, 'appt_date', a.appt_date,
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
    'transport', case when coalesce(a.offer_data->>'transportCost', '') ~ '^[0-9]+(\.[0-9]+)?$'
                      then (a.offer_data->>'transportCost')::numeric else 0 end,
    'locked', (a.status <> 'pending' or a.event_id is not null),
    'expires_at', a.share_expires_at)
  from public.appointments a
  where p_token is not null and length(p_token) between 20 and 64
    and a.share_token = p_token and a.share_expires_at > now()
    and a.name1 is distinct from '—' and (a.offer_data is not null or a.client_selections is not null)
$$;
