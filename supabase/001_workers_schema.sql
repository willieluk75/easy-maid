-- ============================================================
-- Easy Maid — Workers Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. workers (外傭主要資料)
-- ============================================================
CREATE TABLE workers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,  -- 外傭自己的登入帳號
  code          text UNIQUE,                -- 由管理員指定, e.g. "AM 25131"

  -- 基本資料
  name          text NOT NULL,
  photo_url     text,
  nationality   text DEFAULT 'Filipino',
  gender        text CHECK (gender IN ('F', 'M')),
  date_of_birth date,
  marital_status text CHECK (marital_status IN ('Single','Married','Divorced','Widowed')),
  education     text,                       -- College / High School / etc.
  religion      text,
  height_cm     integer,
  weight_kg     integer,
  birth_order   integer,                    -- 家中排行
  num_brothers  integer DEFAULT 0,
  num_sisters   integer DEFAULT 0,
  num_sons      integer DEFAULT 0,
  son_ages      text,                       -- e.g. "22 / 25"
  num_daughters integer DEFAULT 0,
  daughter_ages text,

  -- 聯絡資料 (香港)
  hkid          text,                       -- 香港身份證號碼
  hk_mobile     text,                       -- 香港手機號碼

  -- 技能概覽 (Page 1 checkboxes)
  skill_care_babies    boolean DEFAULT false,
  skill_care_toddler   boolean DEFAULT false,
  skill_care_children  boolean DEFAULT false,
  skill_care_elderly   boolean DEFAULT false,
  skill_care_disabled  boolean DEFAULT false,
  skill_care_bedridden boolean DEFAULT false,
  skill_care_pet       boolean DEFAULT false,
  skill_household      boolean DEFAULT false,
  skill_car_washing    boolean DEFAULT false,
  skill_gardening      boolean DEFAULT false,
  skill_cooking        boolean DEFAULT false,
  skill_driving        boolean DEFAULT false,
  skill_pickup_taobao  boolean DEFAULT false,  -- 代購淘寶

  -- 語言能力
  lang_mandarin  text CHECK (lang_mandarin  IN ('poor','fair','good')),
  lang_cantonese text CHECK (lang_cantonese IN ('poor','fair','good')),
  lang_english   text CHECK (lang_english   IN ('poor','fair','good')),

  -- 其他問題 (Page 2 Other Questions)
  eats_pork            boolean,
  available_sundays    boolean,
  can_share_room       boolean,
  share_room_notes     text,
  has_tattoo           boolean DEFAULT false,
  smokes               boolean DEFAULT false,
  afraid_of_pets       boolean DEFAULT false,
  had_surgery          boolean DEFAULT false,
  surgery_details      text,
  has_allergies        boolean DEFAULT false,
  allergy_details      text,

  -- 合約資料
  contract_end_date date,               -- 本合約最後日期

  -- 備注 & 狀態
  remark  text,
  status  text DEFAULT 'pending'
            CHECK (status IN ('pending','available','hired','processing')),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workers_updated_at
  BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 2. worker_overseas_experience (海外工作概覽)
-- ============================================================
CREATE TABLE worker_overseas_experience (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id   uuid NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  country     text NOT NULL,    -- Hong Kong / Singapore / Taiwan / Malaysia / Middle East / Macau / Home Country / Other
  duration    text,             -- e.g. "3 YEARS & 2 MONTHS"
  display_order integer DEFAULT 0
);


-- ============================================================
-- 3. worker_previous_duties (過去工作詳情, Page 2)
-- ============================================================
CREATE TABLE worker_previous_duties (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id   uuid NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  job_order   integer NOT NULL,          -- 第幾份工作 (1, 2, 3...)

  working_country      text,
  duration_from        text,             -- e.g. "2020/01"
  duration_to          text,             -- e.g. "2023/06" 或 "Present"
  salary               text,
  reason_to_leave      text,
  employer_family_info text,             -- 僱主家庭人口描述 (No. of Babies, etc.)

  -- 該份工作中負責的技能
  skill_care_babies    boolean DEFAULT false,
  baby_age_range       text,
  skill_care_toddler   boolean DEFAULT false,
  toddler_age_range    text,
  skill_care_children  boolean DEFAULT false,
  children_age_range   text,
  skill_care_elderly   boolean DEFAULT false,
  skill_care_disabled  boolean DEFAULT false,
  skill_care_bedridden boolean DEFAULT false,
  skill_care_pet       boolean DEFAULT false,
  skill_household      boolean DEFAULT false,
  skill_car_washing    boolean DEFAULT false,
  skill_gardening      boolean DEFAULT false,
  skill_cooking        boolean DEFAULT false,
  skill_driving        boolean DEFAULT false,
  skill_pickup_taobao  boolean DEFAULT false   -- 代購淘寶
);


-- ============================================================
-- 4. Row Level Security (RLS)
-- ============================================================
ALTER TABLE workers                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_overseas_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_previous_duties   ENABLE ROW LEVEL SECURITY;

-- workers: 公開可讀 available/hired 的資料
CREATE POLICY "Public can view available workers"
  ON workers FOR SELECT
  USING (status IN ('available', 'hired', 'processing'));

-- workers: 本人可讀自己的全部資料 (包含 pending)
CREATE POLICY "Worker can view own profile"
  ON workers FOR SELECT
  USING (auth.uid() = user_id);

-- workers: 本人可修改自己的資料
CREATE POLICY "Worker can update own profile"
  ON workers FOR UPDATE
  USING (auth.uid() = user_id);

-- workers: 登入用戶可新增自己的資料
CREATE POLICY "Authenticated user can insert own profile"
  ON workers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- overseas_experience: 跟隨 worker 的讀寫權限
CREATE POLICY "Public can view overseas experience of visible workers"
  ON worker_overseas_experience FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.id = worker_id
        AND (w.status IN ('available','hired','processing') OR w.user_id = auth.uid())
    )
  );

CREATE POLICY "Worker can manage own overseas experience"
  ON worker_overseas_experience FOR ALL
  USING (
    EXISTS (SELECT 1 FROM workers w WHERE w.id = worker_id AND w.user_id = auth.uid())
  );

-- previous_duties: 跟隨 worker 的讀寫權限
CREATE POLICY "Public can view duties of visible workers"
  ON worker_previous_duties FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.id = worker_id
        AND (w.status IN ('available','hired','processing') OR w.user_id = auth.uid())
    )
  );

CREATE POLICY "Worker can manage own previous duties"
  ON worker_previous_duties FOR ALL
  USING (
    EXISTS (SELECT 1 FROM workers w WHERE w.id = worker_id AND w.user_id = auth.uid())
  );


-- ============================================================
-- 5. worker_media (外傭相片/影片)
-- ============================================================
CREATE TABLE worker_media (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id     uuid NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  url           text NOT NULL,
  storage_path  text,
  type          text NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
  caption       text,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE worker_media ENABLE ROW LEVEL SECURITY;

-- 公開可讀 visible worker 的媒體
CREATE POLICY "Public can view media of visible workers"
  ON worker_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.id = worker_id
        AND (w.status IN ('available','hired','processing') OR w.user_id = auth.uid())
    )
  );

-- 本人可管理自己的媒體
CREATE POLICY "Worker can manage own media"
  ON worker_media FOR ALL
  USING (
    EXISTS (SELECT 1 FROM workers w WHERE w.id = worker_id AND w.user_id = auth.uid())
  );


-- ============================================================
-- 6. media_likes (媒體按讚)
-- ============================================================
CREATE TABLE media_likes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id   uuid NOT NULL REFERENCES worker_media(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, media_id)
);

ALTER TABLE media_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view likes"
  ON media_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated user can like"
  ON media_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can unlike own likes"
  ON media_likes FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- 7. media_bookmarks (媒體收藏)
-- ============================================================
CREATE TABLE media_bookmarks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id   uuid NOT NULL REFERENCES worker_media(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, media_id)
);

ALTER TABLE media_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view own bookmarks"
  ON media_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated user can bookmark"
  ON media_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can remove own bookmarks"
  ON media_bookmarks FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- 8. user_roles (角色系統)
-- ============================================================
CREATE TABLE user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role    text NOT NULL DEFAULT 'worker'
          CHECK (role IN ('worker','employer','admin'))
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can view own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- 僅 service_role 可 INSERT/UPDATE（透過 trigger 或 admin 操作）
CREATE POLICY "Service role can manage roles"
  ON user_roles FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================
-- 9. employers (僱主資料)
-- ============================================================
CREATE TABLE employers (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  company_name text,
  contact_name text NOT NULL,
  phone        text,
  district     text,   -- HK Island / Kowloon / NT
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE employers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employer can view own record"
  ON employers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Employer can update own record"
  ON employers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated user can insert own employer record"
  ON employers FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 10. inquiries (僱主詢問外傭)
-- ============================================================
CREATE TABLE inquiries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  worker_id   uuid NOT NULL REFERENCES workers(id)   ON DELETE CASCADE,
  message     text,
  status      text DEFAULT 'pending'
              CHECK (status IN ('pending','replied','closed')),
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 僱主可讀自己發出的詢問
CREATE POLICY "Employer can view own inquiries"
  ON inquiries FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM employers e WHERE e.id = employer_id AND e.user_id = auth.uid())
  );

-- 外傭可讀收到的詢問
CREATE POLICY "Worker can view received inquiries"
  ON inquiries FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM workers w WHERE w.id = worker_id AND w.user_id = auth.uid())
  );

-- 僱主可發送詢問
CREATE POLICY "Employer can create inquiry"
  ON inquiries FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM employers e WHERE e.id = employer_id AND e.user_id = auth.uid())
  );


-- ============================================================
-- 11. worker_bookmarks (僱主收藏外傭)
-- ============================================================
CREATE TABLE worker_bookmarks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  worker_id  uuid NOT NULL REFERENCES workers(id)     ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, worker_id)
);

ALTER TABLE worker_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view own worker bookmarks"
  ON worker_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated user can bookmark worker"
  ON worker_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can remove own worker bookmarks"
  ON worker_bookmarks FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- 12. get_feed RPC (Feed 動態查詢)
-- ============================================================
CREATE OR REPLACE FUNCTION get_feed(p_user_id uuid DEFAULT null)
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
ORDER BY m.created_at DESC;
$$ LANGUAGE sql STABLE;


-- ============================================================
-- 13. Storage bucket for photos & documents
-- ============================================================
-- Run in Supabase Dashboard → Storage → New Bucket:
--   Bucket name: worker-assets
--   Public: true (方便直接用 URL 顯示照片)
--
-- 或用以下 SQL (需要 storage schema 權限):
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('worker-assets', 'worker-assets', true);
