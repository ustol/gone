-- Who can post tributes/condolences
ALTER TABLE announcements
  ADD COLUMN tribute_access text NOT NULL DEFAULT 'registered'
  CHECK (tribute_access IN ('registered', 'visitors'));

-- Allow guest/visitor posts (author_id becomes nullable)
ALTER TABLE tributes ALTER COLUMN author_id DROP NOT NULL;
ALTER TABLE tributes ADD COLUMN guest_name text;

-- Guest posts: anonymous inserts when announcement allows visitors
CREATE POLICY "tributes_insert_visitor" ON tributes
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL
    AND author_id IS NULL
    AND guest_name IS NOT NULL
    AND (SELECT tribute_access FROM announcements WHERE id = announcement_id) = 'visitors'
  );
