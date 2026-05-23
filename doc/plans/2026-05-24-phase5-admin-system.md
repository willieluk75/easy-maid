# Phase 5 — Admin 管理員系統 實施計劃

> **For Hermes:** Use Claude Code (terminal `claude -p`) to implement each task. Use delegate_task subagent to verify.

**Goal:** 建立管理員後台，讓 admin 用戶可以審核 pending 外傭、分配編號、管理狀態。

**Architecture:** 在 Worker App (root) 新增 `/admin/*` 路由，使用 page-level auth guard 檢查 user_roles 為 admin。Admin 可瀏覽 pending workers、查看完整資料、批准/拒絕/修改狀態。

**Tech Stack:** Next.js App Router + Supabase (RLS) + Tailwind CSS v4

---

## 現狀分析

- ✅ `user_roles` 表已存在，admin 測試帳號已建立 (admin@test.com, role='admin')
- ✅ `workers` 表 status CHECK: `('pending','available','hired','processing')` — 缺少 `'rejected'`
- ❌ 無任何 `/admin/*` 頁面
- ❌ 無 admin RLS policies（admin 需要能讀取所有 workers）

---

## Task 1: DB Migration — 加入 'rejected' status + Admin RLS

**Objective:** 擴展 workers.status CHECK 加入 'rejected'，並新增 admin 可讀寫所有 workers 的 RLS policies。

**Files:**
- Create: `supabase/003_admin_policies.sql`

**Step 1: 建立 migration SQL**

```sql
-- 003_admin_policies.sql
-- Phase 5: Admin policies + rejected status

-- 1. 擴展 workers.status CHECK 加入 'rejected'
ALTER TABLE workers DROP CONSTRAINT workers_status_check;
ALTER TABLE workers ADD CONSTRAINT workers_status_check
  CHECK (status IN ('pending','available','hired','processing','rejected'));

-- 2. Admin 可讀取所有 workers（包含 pending）
CREATE POLICY "Admin can view all workers"
  ON workers FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 3. Admin 可更新所有 workers（改狀態、分配 code）
CREATE POLICY "Admin can update all workers"
  ON workers FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 4. Admin 可刪除 workers（拒絕時）
CREATE POLICY "Admin can delete workers"
  ON workers FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 5. Admin 可讀取所有 user_roles
CREATE POLICY "Admin can view all roles"
  ON user_roles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );
```

**Step 2: 在 local Supabase 執行 migration**

```bash
cd /home/user/supabase && source .env
# 用 psql 或 curl 執行
docker exec -i supabase-db psql -U postgres -d postgres < /home/user/easy-maid/supabase/003_admin_policies.sql
```

**Step 3: 驗證**

```bash
# 確認 admin@test.com 可以讀取 pending workers（需要用 admin 用戶的 token 測試）
# 確認 status CHECK 包含 rejected
```

---

## Task 2: Admin Auth Guard Component

**Objective:** 建立一個可重用的 admin auth guard component，保護所有 `/admin/*` 頁面。

**Files:**
- Create: `src/components/AdminGuard.tsx`

**Step 1: 建立 AdminGuard component**

```tsx
'use client';
import { useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/signin'); return; }
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      if (roleRow?.role !== 'admin') { router.replace('/signin'); return; }
      setIsAdmin(true);
      setChecking(false);
    })();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#222222]" />
      </div>
    );
  }
  if (!isAdmin) return null;
  return <>{children}</>;
}
```

---

## Task 3: Admin Layout + 導航

**Objective:** 建立共用的 admin layout，含頂部導航列。

**Files:**
- Create: `src/app/admin/layout.tsx`

**Step 1: 建立 admin layout**

```tsx
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AdminGuard from '@/components/AdminGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#f7f7f7]">
        {/* Header */}
        <header className="bg-white border-b border-[#dddddd] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/workers" className="text-xl font-bold text-[#222222]">
              Easy Maid Admin
            </Link>
            <nav className="flex gap-4">
              <Link
                href="/admin/workers"
                className={`text-sm font-medium pb-1 ${
                  pathname === '/admin/workers' ? 'text-[#222222] border-b-2 border-[#222222]' : 'text-[#6a6a6a]'
                }`}
              >
                外傭審核
              </Link>
            </nav>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.replace('/signin'); }}
            className="text-sm text-[#6a6a6a] hover:text-[#222222]"
          >
            登出
          </button>
        </header>
        <main className="max-w-4xl mx-auto p-6">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
```

---

## Task 4: Admin Pending Workers List — `/admin/workers`

**Objective:** 列出所有 workers（按 status 分組），admin 可快速篩選 pending。

**Files:**
- Create: `src/app/admin/workers/page.tsx`

**功能需求：**
- 頂部 status filter tabs: 全部 | Pending | Available | Processing | Hired | Rejected
- 每個 worker card 顯示：照片、姓名、國籍、status badge、提交日期
- 點擊跳轉到 `/admin/workers/[id]`
- 使用 service_role 或 admin RLS policy 查詢

**Step 1: 建立 page.tsx**

```tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Worker type - include all display fields
interface AdminWorker {
  id: string;
  name: string;
  nationality: string | null;
  photo_url: string | null;
  status: string;
  created_at: string;
  code: string | null;
}

const STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: 'Pending' },
  { key: 'available', label: 'Available' },
  { key: 'processing', label: 'Processing' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  available: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  hired: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState<AdminWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchWorkers();
  }, []);

  async function fetchWorkers() {
    // 使用 admin RLS 讀取所有 workers
    const { data, error } = await supabase
      .from('workers')
      .select('id, name, nationality, photo_url, status, created_at, code')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setWorkers(data);
      // count by status
      const c: Record<string, number> = { all: data.length };
      data.forEach(w => { c[w.status] = (c[w.status] || 0) + 1; });
      setCounts(c);
    }
    setLoading(false);
  }

  const filtered = activeTab === 'all'
    ? workers
    : workers.filter(w => w.status === activeTab);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">外傭管理</h1>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#222222] text-white'
                : 'bg-white text-[#6a6a6a] border border-[#dddddd] hover:border-[#222222]'
            }`}
          >
            {tab.label}
            {counts[tab.key] !== undefined && (
              <span className="ml-1.5 text-xs opacity-70">({counts[tab.key]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Worker List */}
      {loading ? (
        <div className="text-center py-12 text-[#6a6a6a]">載入中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-[#929292]">沒有符合的記錄</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(w => (
            <Link
              key={w.id}
              href={`/admin/workers/${w.id}`}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#dddddd] hover:shadow-md transition-shadow"
            >
              {/* Photo */}
              <div className="w-12 h-12 rounded-full bg-[#f7f7f7] overflow-hidden flex-shrink-0">
                {w.photo_url ? (
                  <img src={w.photo_url} alt={w.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#929292] text-lg">
                    {w.name?.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#222222]">{w.name}</span>
                  {w.code && (
                    <span className="text-xs bg-[#f7f7f7] text-[#6a6a6a] px-2 py-0.5 rounded">
                      #{w.code}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#6a6a6a]">
                  {w.nationality || '—'} · {new Date(w.created_at).toLocaleDateString('zh-TW')}
                </p>
              </div>

              {/* Status Badge */}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[w.status] || 'bg-gray-100 text-gray-800'}`}>
                {w.status}
              </span>

              {/* Arrow */}
              <svg className="w-5 h-5 text-[#929292]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Task 5: Admin Worker Detail — `/admin/workers/[id]`

**Objective:** 顯示外傭完整資料，含批准/拒絕/改狀態功能。

**Files:**
- Create: `src/app/admin/workers/[id]/page.tsx`

**功能需求：**
- 顯示 worker 全部資料（基本資料、海外經驗、過去工作）
- 顯示已上傳的媒體
- 「批准」按鈕：彈出 modal 輸入 code → UPDATE status='available', code=xxx
- 「拒絕」按鈕：confirm dialog → UPDATE status='rejected'
- 狀態下拉：可改 available/processing/hired
- 返回按鈕

**Step 1: 建立 page.tsx**

頁面結構：
1. Header: 返回箭頭 + 姓名 + 狀態 badge
2. Basic Info Card: 照片、姓名、國籍、性別、生日、婚姻、教育、宗教、身高體重等
3. Skills Card: 技能列表
4. Experience Card: 海外經驗 + 過去工作
5. Media Gallery: 已上傳的照片/影片
6. Action Bar (底部固定): 批准 + 拒絕按鈕 + 狀態下拉

---

## Task 6: 驗證 + 測試

**Objective:** 用 admin@test.com 登入，測試完整 admin 流程。

**驗證步驟：**
1. 登入 admin@test.com / test1234
2. 訪問 `/admin/workers` — 應該看到 worker 列表
3. 點擊一個 pending worker — 應該看到完整資料
4. 批准 worker（輸入 code "EM001"）— status 應變為 available
5. 拒絕另一個 pending worker — status 應變為 rejected
6. 改變一個 worker 的狀態 — 應該成功更新
7. 非 admin 用戶訪問 `/admin/*` — 應 redirect 到 /signin

---

## 執行順序

1. **Task 1** (DB migration) — 先執行 SQL
2. **Task 2** (AdminGuard) — 建立共用 component
3. **Task 3** (Admin Layout) — 建立版型
4. **Task 4** (Workers List) — 列表頁
5. **Task 5** (Worker Detail) — 詳情頁
6. **Task 6** (驗證) — 端到端測試
