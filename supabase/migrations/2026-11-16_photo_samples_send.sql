-- =====================================================================
--  Κατάσταση φωτογραφιών: νέο στάδιο «Να σταλθούν τα δείγματα» (samples_send)
--  ανάμεσα σε «Να γίνουν δείγματα» και «Έλαβαν δείγματα και περιμένουμε».
--  Μόνο προσθήκη τιμής· οι υπάρχουσες εκδηλώσεις δεν αλλάζουν.
-- =====================================================================
alter table public.events drop constraint if exists events_photo_status_check;
alter table public.events add constraint events_photo_status_check
  check (photo_status in ('samples_todo','samples_send','samples_pickup','samples_waiting','changes','lab','ready','delivered'));
