-- Φωτογραφίες προφίλ (v1.16.0)
-- 1) Στήλη με τη διαδρομή της φωτογραφίας (π.χ. "<id>/1731640000000.jpg")
alter table public.profiles add column if not exists avatar_path text;
alter table public.profiles drop constraint if exists profiles_avatar_path_chk;
alter table public.profiles add constraint profiles_avatar_path_chk
  check (avatar_path is null or avatar_path ~ ('^' || id::text || '/[0-9]{10,16}\.jpg$'));
-- κάθε χρήστης αλλάζει μόνο τη δική του (η πολιτική profiles_update_self ισχύει ήδη)
grant update (avatar_path) on public.profiles to authenticated;

-- 2) Χώρος αποθήκευσης "avatars": μόνο εικόνες JPEG έως 1 MB (η εφαρμογή τις μικραίνει ~30 KB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 1048576, allowed_mime_types = array['image/jpeg'];

-- 3) Ο καθένας ανεβάζει / σβήνει μόνο στον δικό του φάκελο (<id χρήστη>/...)
drop policy if exists avatars_own_select on storage.objects;
drop policy if exists avatars_own_insert on storage.objects;
drop policy if exists avatars_own_update on storage.objects;
drop policy if exists avatars_own_delete on storage.objects;
create policy avatars_own_select on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy avatars_own_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy avatars_own_update on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy avatars_own_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
