-- 006: media_comments table for Feed comments

CREATE TABLE IF NOT EXISTS media_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES worker_media(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_comments_media ON media_comments(media_id, created_at);

-- RLS
ALTER TABLE media_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON media_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON media_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON media_comments FOR DELETE
  USING (auth.uid() = user_id);
