-- =============================================================
-- Funeral Matters (FM) — Initial Database Schema
-- =============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for partial text search

-- =============================================================
-- PROFILES
-- =============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  display_name TEXT,
  email       TEXT NOT NULL,
  avatar_url  TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON profiles USING btree (username);

-- =============================================================
-- USER PREFERENCES
-- =============================================================
CREATE TABLE user_preferences (
  user_id             UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  theme               TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- ANNOUNCEMENTS
-- =============================================================
CREATE TABLE announcements (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             TEXT UNIQUE NOT NULL,
  creator_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  surname          TEXT NOT NULL,
  first_name       TEXT NOT NULL,
  other_names      TEXT,
  date_of_birth    DATE,
  date_of_death    DATE NOT NULL,
  place_of_death   TEXT NOT NULL,
  short_message    TEXT NOT NULL,
  image_url        TEXT,
  moderation_mode  TEXT NOT NULL DEFAULT 'auto' CHECK (moderation_mode IN ('auto', 'manual')),
  is_published     BOOLEAN NOT NULL DEFAULT TRUE,
  tribute_count    INTEGER NOT NULL DEFAULT 0,
  condolence_count INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_slug        ON announcements USING btree (slug);
CREATE INDEX idx_announcements_creator_id  ON announcements USING btree (creator_id);
CREATE INDEX idx_announcements_date_death  ON announcements USING btree (date_of_death DESC);
CREATE INDEX idx_announcements_surname_trgm ON announcements USING gin (surname gin_trgm_ops);
CREATE INDEX idx_announcements_first_name_trgm ON announcements USING gin (first_name gin_trgm_ops);
CREATE INDEX idx_announcements_place_trgm  ON announcements USING gin (place_of_death gin_trgm_ops);

-- =============================================================
-- TRIBUTES & CONDOLENCES
-- =============================================================
CREATE TABLE tributes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('tribute', 'condolence')),
  message         TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tributes_announcement_id ON tributes USING btree (announcement_id);
CREATE INDEX idx_tributes_author_id       ON tributes USING btree (author_id);
CREATE INDEX idx_tributes_status          ON tributes USING btree (status);

-- =============================================================
-- NOTIFICATIONS
-- =============================================================
CREATE TABLE notifications (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type                    TEXT NOT NULL CHECK (type IN ('tribute_approved','tribute_rejected','new_tribute','new_condolence')),
  title                   TEXT NOT NULL,
  body                    TEXT NOT NULL,
  is_read                 BOOLEAN NOT NULL DEFAULT FALSE,
  related_announcement_id UUID REFERENCES announcements(id) ON DELETE SET NULL,
  related_tribute_id      UUID REFERENCES tributes(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id   ON notifications USING btree (user_id);
CREATE INDEX idx_notifications_is_read   ON notifications USING btree (is_read);
CREATE INDEX idx_notifications_created   ON notifications USING btree (created_at DESC);

-- =============================================================
-- SHARES
-- =============================================================
CREATE TABLE shares (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shares_announcement_id ON shares USING btree (announcement_id);

-- =============================================================
-- AUDIT LOGS
-- =============================================================
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id   UUID,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor_id ON audit_logs USING btree (actor_id);
CREATE INDEX idx_audit_logs_created  ON audit_logs USING btree (created_at DESC);

-- =============================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tributes_updated_at
  BEFORE UPDATE ON tributes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Maintain tribute_count and condolence_count on announcements
CREATE OR REPLACE FUNCTION update_tribute_counts()
RETURNS TRIGGER AS $$
DECLARE
  ann_id UUID;
BEGIN
  ann_id := COALESCE(NEW.announcement_id, OLD.announcement_id);

  UPDATE announcements SET
    tribute_count    = (SELECT COUNT(*) FROM tributes WHERE announcement_id = ann_id AND type = 'tribute'    AND status = 'approved'),
    condolence_count = (SELECT COUNT(*) FROM tributes WHERE announcement_id = ann_id AND type = 'condolence' AND status = 'approved')
  WHERE id = ann_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tribute_counts
  AFTER INSERT OR UPDATE OR DELETE ON tributes
  FOR EACH ROW EXECUTE FUNCTION update_tribute_counts();

-- Auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO user_preferences (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tributes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences  ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_all"   ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own"   ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON profiles FOR UPDATE USING (auth.uid() = id);

-- User Preferences
CREATE POLICY "prefs_select_own"  ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "prefs_insert_own"  ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prefs_update_own"  ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Announcements
CREATE POLICY "announcements_select_published" ON announcements FOR SELECT
  USING (is_published = true OR auth.uid() = creator_id);

CREATE POLICY "announcements_insert_auth" ON announcements FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "announcements_update_own" ON announcements FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "announcements_delete_own" ON announcements FOR DELETE
  USING (auth.uid() = creator_id);

-- Tributes
CREATE POLICY "tributes_select_approved_or_own" ON tributes FOR SELECT
  USING (
    status = 'approved'
    OR auth.uid() = author_id
    OR auth.uid() = (SELECT creator_id FROM announcements WHERE id = announcement_id)
  );

CREATE POLICY "tributes_insert_auth" ON tributes FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "tributes_update_owner_or_author" ON tributes FOR UPDATE
  USING (
    auth.uid() = author_id
    OR auth.uid() = (SELECT creator_id FROM announcements WHERE id = announcement_id)
  );

CREATE POLICY "tributes_delete_owner_or_author" ON tributes FOR DELETE
  USING (
    auth.uid() = author_id
    OR auth.uid() = (SELECT creator_id FROM announcements WHERE id = announcement_id)
  );

-- Notifications
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_service" ON notifications FOR INSERT WITH CHECK (true);

-- Shares
CREATE POLICY "shares_select_all"  ON shares FOR SELECT USING (true);
CREATE POLICY "shares_insert_all"  ON shares FOR INSERT WITH CHECK (true);

-- Audit Logs (read-only for admins via service role; no direct user access)
CREATE POLICY "audit_logs_none" ON audit_logs FOR SELECT USING (false);
