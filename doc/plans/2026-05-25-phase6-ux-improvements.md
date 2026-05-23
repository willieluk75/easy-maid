# Phase 6 — UX 改善實作計劃

## 目標
完成 T60-T68 共 9 個 UX 改善任務，涵蓋 Worker App (port 3000) 和 Employer App (port 3001)。

## 執行順序

### Batch 1: DB migrations（先執行）
- T67: `workers` 加 `banner_url text` 欄位
- T65: 新建 `media_comments` 表 + RLS
- T66: 新建 `notifications` 表 + RLS
- T63: 更新 `get_feed` RPC 加 `p_offset` 參數

### Batch 2: Middleware (T60)
- Worker App: `src/middleware.ts` — 保護 `/profile`, `/worker/*`, `/feed`, `/admin/*`
- Worker App: `src/lib/supabase-server.ts` — server-side Supabase client
- Employer App: `employer-app/src/middleware.ts` — 保護 `/profile`, `/bookmarks`, `/inquiries`
- Employer App: `employer-app/src/lib/supabase-server.ts`

### Batch 3: Workers 搜尋 + Load More (T61+T62)
- Worker App `src/app/workers/page.tsx` — 加 search input + Load More button
- Employer App `employer-app/src/app/workers/page.tsx` — 加 search input + Load More button

### Batch 4: Feed Load More + Skeleton (T63+T64)
- Worker App `src/app/feed/page.tsx` — Load More button + skeleton UI
- Employer App `employer-app/src/app/feed/page.tsx` — Load More button + skeleton UI

### Batch 5: Feed 評論 (T65)
- Worker App `src/app/feed/page.tsx` — 評論展開/收起 + 留言輸入

### Batch 6: 通知系統 (T66)
- Worker App `src/app/notifications/page.tsx` + layout.tsx
- Employer App `employer-app/src/app/notifications/page.tsx` + layout.tsx
- Feed header 加通知鈴鐺 icon

### Batch 7: 封面照片 (T67)
- Worker App `src/app/profile/page.tsx` — banner 上傳 + 顯示

### Batch 8: SEO metadata (T68)
- Worker App layout.tsx — title template + description
- Employer App layout.tsx — title template + description
- Workers/Feed layout.tsx — per-page metadata

## Claude Code 任務拆分

每個 Batch 用獨立的 Claude Code prompt 執行，避免超時。
Prompt 會包含：具體文件路徑、需求描述、現有程式碼結構。

## Testing
完成後用 delegate_task subagent 做：
1. TypeScript 編譯檢查 (tsc --noEmit)
2. Playwright E2E 測試
3. Code review
