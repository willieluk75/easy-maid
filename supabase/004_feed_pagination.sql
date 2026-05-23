-- 004: Update get_feed RPC to support pagination (offset + limit)

CREATE OR REPLACE FUNCTION get_feed(p_user_id uuid DEFAULT null, p_offset int DEFAULT 0, p_limit int DEFAULT 20)
RETURNS TABLE (
  id           uuid,
  worker_id    uuid,
  url          text,
  storage_path text,
  type         text,
  caption      text,
  created_at   timestamptz,
  worker_name  text,
  nationality  text,
  photo_url    text,
  like_count   bigint,
  liked        boolean,
  bookmarked   boolean
) AS $$
SELECT
  m.id,
  m.worker_id,
  m.url,
  m.storage_path,
  m.type,
  m.caption,
  m.created_at,
  w.name        AS worker_name,
  w.nationality,
  w.photo_url,
  (SELECT COUNT(*) FROM media_likes ml WHERE ml.media_id = m.id) AS like_count,
  (p_user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM media_likes ml WHERE ml.media_id = m.id AND ml.user_id = p_user_id
  )) AS liked,
  (p_user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM media_bookmarks mb WHERE mb.media_id = m.id AND mb.user_id = p_user_id
  )) AS bookmarked
FROM worker_media m
JOIN workers w ON w.id = m.worker_id
WHERE w.status IN ('available', 'hired', 'processing')
ORDER BY m.created_at DESC
LIMIT p_limit OFFSET p_offset;
$$ LANGUAGE sql STABLE;
