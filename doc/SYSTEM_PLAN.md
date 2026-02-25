# Easy Maid — 系統設計計劃 (SYSTEM_PLAN.md)

## Context
用原子化方式把整個 Easy Maid 外傭招聘平台的功能規劃好，作為全期路線圖。

---

## 系統概覽

**定位：** 香港外傭招聘平台，外傭自助填資料，僱主瀏覽外傭。
**三類用戶：**

| 角色 | 說明 |
|------|------|
| Worker（外傭）| 自助登記資料、上傳媒體、管理 profile |
| Employer（僱主）| 瀏覽外傭、收藏、發出詢問 |
| Admin（管理員）| 審核 pending 外傭、分配編號、管理狀態 |

**Tech Stack:** Next.js 15 App Router · TypeScript · Tailwind CSS · Supabase (Auth + PostgreSQL + Storage)
**Project ID:** `apytwhemutebpokzkpis` (ap-northeast-1 東京)

---

## 現有已完成功能

| 模組 | 已完成 |
|------|--------|
| Auth | Email / Google / Facebook 登入＋註冊 |
| Worker | 8步驟登記表單、Profile 顯示、Edit |
| Media | 相片影片上傳（caption modal）、Storage bucket `worker-assets` |
| Feed | 垂直卡片 Feed、❤️ likes、🔖 bookmarks |
| DB | workers, worker_overseas_experience, worker_previous_duties, worker_media, media_likes, media_bookmarks |

---

## 資料庫設計（Full Schema）

### 現有表格
```
workers                    — 外傭主資料（52 欄）+ RLS
worker_overseas_experience — 海外工作記錄 + RLS
worker_previous_duties     — 過去工作詳情 + RLS
worker_media               — 相片影片（url, type, caption）+ RLS (public read for visible workers)
media_likes                — user_id × media_id UNIQUE + RLS (public read)
media_bookmarks            — user_id × media_id UNIQUE + RLS (owner only)
```

### 計劃新增表格

**`user_roles`** — 角色系統
```sql
CREATE TABLE user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role    text NOT NULL DEFAULT 'worker'
          CHECK (role IN ('worker','employer','admin'))
);
-- RLS: 本人讀自己；admin 可讀全部
```

**`employers`** — 僱主資料
```sql
CREATE TABLE employers (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  company_name text,
  contact_name text NOT NULL,
  phone        text,
  district     text,   -- 香港地區 (HK Island / Kowloon / NT)
  created_at   timestamptz DEFAULT now()
);
-- RLS: 本人可 CRUD；公開可讀 contact_name（詢問用）
```

**`inquiries`** — 僱主詢問外傭
```sql
CREATE TABLE inquiries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES employers(id) ON DELETE CASCADE,
  worker_id   uuid REFERENCES workers(id)   ON DELETE CASCADE,
  message     text,
  status      text DEFAULT 'pending'
              CHECK (status IN ('pending','replied','closed')),
  created_at  timestamptz DEFAULT now()
);
-- RLS: employer_id 對應僱主可讀寫；worker_id 對應外傭可讀
```

**`worker_bookmarks`** — 僱主收藏外傭（非 media）
```sql
CREATE TABLE worker_bookmarks (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid REFERENCES auth.users(id)  ON DELETE CASCADE,
  worker_id uuid REFERENCES workers(id)     ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, worker_id)
);
-- RLS: owner only
```

---

## 頁面架構（All Pages）

### 現有頁面
| 路徑 | 功能 |
|------|------|
| `/` | 跳轉（已登入→/feed，否則→/signin）|
| `/signin` | Email/Google/Facebook 登入 |
| `/signup` | 登入 |
| `/profile` | Worker 自己 profile + 媒體上傳 |
| `/worker/register` | 8步驟登記表單 |
| `/worker/edit` | 修改資料 |
| `/worker/success` | 提交成功 |
| `/feed` | 外傭媒體動態（likes + bookmarks）|

### 計劃頁面
| 路徑 | 功能 | Phase |
|------|------|-------|
| `/workers` | 外傭公開列表（篩選/搜尋）| P1 |
| `/workers/[id]` | 外傭公開詳細 profile | P1 |
| `/bookmarks` | 我的收藏（外傭 + 媒體 tabs）| P2 |
| `/employer/register` | 僱主登記 | P2 |
| `/employer/profile` | 僱主個人頁 | P2 |
| `/inquiries` | 詢問管理（雙方）| P2 |
| `/admin/workers` | Admin 審核列表 | P2 |
| `/admin/workers/[id]` | Admin 審核個別 worker | P2 |

---

## 原子化任務清單

> **命名：** `T##` · Priority: P0必須 / P1重要 / P2錦上添花
> **Deps：** 列出必須先完成的任務 ID

---

### ✅ Phase 0 — 已完成

| ID | 任務 |
|----|------|
| T00 | Auth（Email/Google/Facebook）|
| T01 | Worker 8步驟登記表單 |
| T02 | Worker Profile 頁 |
| T03 | Worker Edit |
| T04 | 相片影片上傳 + caption modal |
| T05 | Feed 頁面（likes + bookmarks）|
| T06 | DB: workers schema + media + likes + bookmarks migrations |

---

### ⬜ Phase 1 — 外傭公開瀏覽（P0）

| ID | 任務 | 分類 | Deps | 驗收 |
|----|------|------|------|------|
| T10 | Workers 列表頁 `/workers` | FE | — | 顯示 available/processing 外傭；每格：頭像、姓名、國籍、技能 chips |
| T11 | Workers 列表：基本篩選（國籍 dropdown）| FE | T10 | 選國籍後列表即時更新 |
| T12 | Workers 列表：技能篩選（multi-select chips）| FE | T10 | 選技能後 AND-filter |
| T13 | Worker 詳細頁 `/workers/[id]` | FE | T10 | 完整 profile 資料（同 /profile 但公開，無編輯按鈕）|
| T14 | Worker 詳細頁：媒體 gallery section | FE | T13 | 顯示該外傭所有媒體，3欄 grid，點擊放大 |
| T15 | 底部 Tab 導航（persistent）| FE | T10 | Feed / 外傭列表 / 書籤 / 我；高亮當前頁 |
| T16 | `/feed` Card 點擊跳 `/workers/[id]` | FE | T13 | 點工人頭像/姓名跳詳細頁 |

---

### ⬜ Phase 2 — 角色系統（P1）

| ID | 任務 | 分類 | Deps | 驗收 |
|----|------|------|------|------|
| T20 | DB: user_roles table + RLS migration | DB | — | 表建立，RLS 正確 |
| T21 | Signup 時預設建立 worker role | FE | T20 | 新用戶 signup → user_roles insert role='worker' |
| T22 | Signup 頁加角色選擇（外傭 / 僱主）| FE | T20 | Radio 選項；預設 worker；選擇後 insert 對應 role |
| T23 | DB: employers table + RLS migration | DB | T20 | 見 schema |
| T24 | 僱主登記頁 `/employer/register` | FE | T23 | 填公司名/聯絡人/電話/地區 → insert employers |
| T25 | 僱主 Profile 頁 `/employer/profile` | FE | T24 | 顯示僱主資料，可編輯，有登出 |

---

### ⬜ Phase 3 — 詢問系統（P1）

| ID | 任務 | 分類 | Deps | 驗收 |
|----|------|------|------|------|
| T30 | DB: inquiries table + RLS migration | DB | T23 | 見 schema |
| T31 | Worker 詳細頁加「聯絡外傭」按鈕 | FE | T13, T30 | 已登入 employer 才可見；未登入→/signin |
| T32 | 詢問 modal（訊息輸入）| FE | T31 | textarea + 送出按鈕 → insert inquiries |
| T33 | 詢問列表 `/inquiries` | FE | T30 | Worker 見收到；Employer 見發出；按 status 分組 |

---

### ⬜ Phase 4 — 收藏系統（P1）

| ID | 任務 | 分類 | Deps | 驗收 |
|----|------|------|------|------|
| T40 | DB: worker_bookmarks table + RLS migration | DB | — | 見 schema |
| T41 | Worker 詳細頁加 🔖 收藏外傭按鈕 | FE | T13, T40 | Toggle + 樂觀更新 |
| T42 | 書籤頁 `/bookmarks` | FE | T40, T05 | Tab 1：收藏外傭列表；Tab 2：收藏媒體貼文 |

---

### ⬜ Phase 5 — 管理員系統（P1）

| ID | 任務 | 分類 | Deps | 驗收 |
|----|------|------|------|------|
| T50 | Admin route guard（page-level）| FE | T20 | /admin/* 非 admin role → redirect /signin |
| T51 | Admin: Pending 列表 `/admin/workers` | FE | T50 | 顯示所有 status='pending' workers，點擊查看 |
| T52 | Admin: 審核詳細 `/admin/workers/[id]` | FE | T51 | 完整資料 + 批准/拒絕按鈕 |
| T53 | Admin: 批准外傭（輸入 code + 設 status='available'）| FE+DB | T52 | workers.code, workers.status 更新；worker 見綠色 badge |
| T54 | Admin: 拒絕外傭（刪除 or status='rejected'）| FE+DB | T52 | Confirm dialog → delete worker record |
| T55 | Admin: 修改狀態（available/processing/hired）| FE | T51 | Dropdown 選狀態 → update workers |
| T56 | DB: workers status 加 'rejected' CHECK | DB | T54 | migration: alter check constraint |

---

### ⬜ Phase 6 — UX 改善（P2）

| ID | 任務 | 分類 | Deps | 驗收 |
|----|------|------|------|------|
| T60 | Middleware: Next.js route protection | FE | T20 | /profile, /worker/* 需 auth；/admin/* 需 admin |
| T61 | Workers 列表：文字搜尋（姓名）| FE | T10 | search input → ilike filter on workers.name |
| T62 | Workers 列表：無限滾動 / Load More | FE | T10 | 每次 20 筆，滾到底 or 按鈕載入更多 |
| T63 | Feed：無限滾動 / Load More | FE | — | 同 T62，更新 get_feed RPC 加 p_offset |
| T64 | Loading Skeleton UI（列表/card）| FE | — | Tailwind animate-pulse skeleton |
| T65 | Feed：評論功能 | FE+DB | — | DB: media_comments; 每帖下方留言 |
| T66 | 通知系統（in-app basic）| FE+DB | — | DB: notifications; 外傭收到詢問/審核結果 |
| T67 | Worker profile 封面照片 | FE+DB | — | workers 加 banner_url 欄；profile 頂部 banner |
| T68 | SEO metadata per page | FE | T13 | /workers/[id] 加 generateMetadata |

---

## 技術決策記錄

| 決策 | 方案 | 原因 |
|------|------|------|
| Route protection | Client-side（現在）→ Middleware（T60）| 快速 MVP 先 client-side，後升級 |
| Admin role | user_roles table | 比 auth metadata 更容易 DB query |
| Employer 識別 | 獨立 employers table | 避免污染 workers table |
| Feed 資料 | RPC `get_feed()` | 一次 round-trip 取回 join 資料 |
| 圖片儲存 | Supabase Storage public bucket | 簡單直接，公開 URL |
| 角色選擇 | Signup 時選擇 | 比事後判斷更清晰 |

---

## 驗收測試矩陣

| 場景 | 步驟 | 預期結果 |
|------|------|---------|
| Worker 完整流程 | 註冊（worker）→ 填表 → 等審核 | profile status=pending |
| Media 上傳 | profile → 上傳 → caption modal → 確認 | 出現在 /feed |
| Like / Bookmark | /feed → 點 ❤️ → 點 🔖 | 樂觀更新；DB 寫入正確 |
| 公開瀏覽 | 未登入 → /workers | 顯示 available/processing workers |
| 外傭詳細 | /workers/[id] | 完整資料 + media gallery |
| 僱主詢問 | 登入(employer) → /workers/[id] → 聯絡 | inquiries 表新增一筆 |
| Admin 批准 | 登入(admin) → /admin/workers → 批准 + 輸入 code | status=available, code 已設 |
| 書籤外傭 | /workers/[id] → 🔖 → /bookmarks | 顯示在 Tab 1 |
