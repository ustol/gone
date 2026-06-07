-- Wreath/flower board feature
ALTER TABLE announcements
  ADD COLUMN wreath_board_enabled boolean NOT NULL DEFAULT false;

CREATE TABLE wreath_placements (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id uuid REFERENCES announcements(id) ON DELETE CASCADE NOT NULL,
  user_id         uuid REFERENCES profiles(id) ON DELETE SET NULL,
  guest_name      text,
  wreath_type     text NOT NULL,
  created_at      timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE wreath_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wreaths_select_all" ON wreath_placements
  FOR SELECT USING (true);

CREATE POLICY "wreaths_insert_auth" ON wreath_placements
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (SELECT wreath_board_enabled FROM announcements WHERE id = announcement_id) = true
  );

CREATE POLICY "wreaths_insert_guest" ON wreath_placements
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL
    AND user_id IS NULL
    AND guest_name IS NOT NULL
    AND (SELECT wreath_board_enabled FROM announcements WHERE id = announcement_id) = true
  );

CREATE POLICY "wreaths_delete_creator" ON wreath_placements
  FOR DELETE USING (
    auth.uid() = user_id
    OR auth.uid() = (SELECT creator_id FROM announcements WHERE id = announcement_id)
  );
