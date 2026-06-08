-- Community photo memories submitted by visitors / users
-- Require creator approval before appearing in the gallery.

create table if not exists community_photos (
  id              uuid        primary key default gen_random_uuid(),
  announcement_id uuid        not null references announcements(id) on delete cascade,
  uploader_id     uuid        references profiles(id) on delete set null,
  guest_name      text,
  url             text        not null,
  storage_path    text        not null,
  caption         text,
  status          text        not null default 'pending'
                              check (status in ('pending', 'approved', 'rejected')),
  created_at      timestamptz not null default now()
);

alter table community_photos enable row level security;

-- Anyone can submit a photo memory
create policy "community_photos_insert_all"
  on community_photos for insert
  with check (true);

-- Public can only see approved photos
create policy "community_photos_select_approved"
  on community_photos for select
  using (status = 'approved');

-- Announcement creator can see all statuses
create policy "community_photos_select_creator"
  on community_photos for select
  using (
    exists (
      select 1 from announcements a
      where a.id = announcement_id
        and a.creator_id = auth.uid()
    )
  );

-- Creator can approve / reject
create policy "community_photos_update_creator"
  on community_photos for update
  using (
    exists (
      select 1 from announcements a
      where a.id = announcement_id
        and a.creator_id = auth.uid()
    )
  );

-- Creator can delete
create policy "community_photos_delete_creator"
  on community_photos for delete
  using (
    exists (
      select 1 from announcements a
      where a.id = announcement_id
        and a.creator_id = auth.uid()
    )
  );

-- Storage: allow anyone to upload to the community/ path in the announcements bucket
create policy "community_photos_storage_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'announcements'
    and (storage.foldername(name))[1] = 'community'
  );
