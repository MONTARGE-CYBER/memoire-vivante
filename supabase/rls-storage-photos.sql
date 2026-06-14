-- Execute this in the Supabase SQL editor if the "photos" bucket is private
-- or before making it private. Files must be stored as:
-- {user_id}/original/{filename}
-- {user_id}/restored/{filename}

drop policy if exists "Users can upload own photos"
  on storage.objects;

create policy "Users can upload own photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can read own photos"
  on storage.objects;

create policy "Users can read own photos"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own photos"
  on storage.objects;

create policy "Users can delete own photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
