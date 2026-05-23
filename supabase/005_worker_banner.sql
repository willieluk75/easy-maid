-- 005: Add banner_url to workers table for profile cover photo
ALTER TABLE workers ADD COLUMN IF NOT EXISTS banner_url text;
