-- =====================================================================
-- 2026-11-12 · Ευρετήρια για ξένα κλειδιά χωρίς ευρετήριο (v1.9.6)
--   Μόνο ταχύτητα· δεν αλλάζει κανένα δεδομένο ή συμπεριφορά.
-- =====================================================================
create index if not exists absences_created_by_idx        on public.absences(created_by);
create index if not exists appointments_created_by_idx    on public.appointments(created_by);
create index if not exists appointments_customer_id_idx   on public.appointments(customer_id);
create index if not exists appointments_handled_by_idx    on public.appointments(handled_by);
create index if not exists calendar_notes_created_by_idx  on public.calendar_notes(created_by);
create index if not exists customers_created_by_idx       on public.customers(created_by);
create index if not exists event_sessions_created_by_idx  on public.event_sessions(created_by);
create index if not exists events_created_by_idx          on public.events(created_by);
create index if not exists expenses_created_by_idx        on public.expenses(created_by);
create index if not exists invite_codes_created_by_idx    on public.invite_codes(created_by);
create index if not exists invite_codes_used_by_idx       on public.invite_codes(used_by);
create index if not exists meetings_created_by_idx        on public.meetings(created_by);
create index if not exists message_queue_sent_by_idx      on public.message_queue(sent_by);
create index if not exists message_queue_template_id_idx  on public.message_queue(template_id);
create index if not exists offer_requests_customer_id_idx on public.offer_requests(customer_id);
create index if not exists offer_requests_handled_by_idx  on public.offer_requests(handled_by);
create index if not exists payments_created_by_idx        on public.payments(created_by);
