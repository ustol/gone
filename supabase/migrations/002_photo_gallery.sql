-- Photo gallery for announcements
CREATE TABLE announcement_photos (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id uuid REFERENCES announcements(id) ON DELETE CASCADE NOT NULL,
  url           text NOT NULL,
  storage_path  text NOT NULL,
  caption       text,
  uploaded_by   uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at    timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE announcement_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "photos_select_all" ON announcement_photos
  FOR SELECT USING (true);

CREATE POLICY "photos_insert_creator" ON announcement_photos
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by
    AND auth.uid() = (SELECT creator_id FROM announcements WHERE id = announcement_id)
  );

CREATE POLICY "photos_delete_creator" ON announcement_photos
  FOR DELETE USING (
    auth.uid() = (SELECT creator_id FROM announcements WHERE id = announcement_id)
  );

-- RLS policy so creators can also update their announcement main image / fields
CREATE POLICY "announcements_update_creator" ON announcements
  FOR UPDATE USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);
