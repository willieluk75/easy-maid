# Easy-Maid 代码 vs 数据库字段对齐核对报告

> 生成时间：2026-05-19
> 数据库 Schema 来源：`supabase/001_workers_schema.sql`（权威来源）
> 核对范围：employer-app/ 和 worker-app/（即 src/）所有 .ts/.tsx 文件

---

## 一、数据库实际字段定义（10 张表 + 1 个 RPC）

### 1. workers
```
id, user_id, code, name, photo_url, nationality, gender, date_of_birth,
marital_status, education, religion, height_cm, weight_kg, birth_order,
num_brothers, num_sisters, num_sons, son_ages, num_daughters, daughter_ages,
hkid, hk_mobile,
skill_care_babies, skill_care_toddler, skill_care_children, skill_care_elderly,
skill_care_disabled, skill_care_bedridden, skill_care_pet, skill_household,
skill_car_washing, skill_gardening, skill_cooking, skill_driving, skill_pickup_taobao,
lang_mandarin, lang_cantonese, lang_english,
eats_pork, available_sundays, can_share_room, share_room_notes,
has_tattoo, smokes, afraid_of_pets, had_surgery, surgery_details,
has_allergies, allergy_details,
contract_end_date, remark, status, created_at, updated_at
```

### 2. worker_overseas_experience
```
id, worker_id, country, duration, display_order
```

### 3. worker_previous_duties
```
id, worker_id, job_order, working_country, duration_from, duration_to, salary,
reason_to_leave, employer_family_info,
skill_care_babies, baby_age_range, skill_care_toddler, toddler_age_range,
skill_care_children, children_age_range, skill_care_elderly, skill_care_disabled,
skill_care_bedridden, skill_care_pet, skill_household, skill_car_washing,
skill_gardening, skill_cooking, skill_driving, skill_pickup_taobao
```

### 4. worker_media
```
id, worker_id, url, storage_path, type, caption, created_at
```

### 5. media_likes
```
id, user_id, media_id, created_at
```

### 6. media_bookmarks
```
id, user_id, media_id, created_at
```

### 7. user_roles
```
user_id, role
```

### 8. employers
```
id, user_id, company_name, contact_name, phone, district, created_at
```

### 9. inquiries
```
id, employer_id, worker_id, message, status, created_at
```

### 10. worker_bookmarks
```
id, user_id, worker_id, created_at
```

### RPC: get_feed(p_user_id)
返回字段：
```
id, worker_id, url, storage_path, type, caption, created_at,
worker_name, nationality, photo_url, like_count, liked, bookmarked
```

---

## 二、逐文件核对结果

### ✅ employer-app/src/app/workers/page.tsx
- **Interface Worker**：字段与 `workers` 表完全对齐 ✅
- **查询** `.from('workers').select(...)` 使用的字段全部存在于数据库 ✅

### ✅ employer-app/src/app/workers/[id]/page.tsx
- **Interface Worker**：字段与 `workers` 表完全对齐 ✅
  - 使用 `remark`（非 remarks）✅
  - 不含 `contract_type`、`experience_hk_years` ✅（之前已修复）
- **查询** `.from('workers').select('*')` 无特定字段问题 ✅
- **查询** `.from('employers').select('id')` ✅
- **查询** `.from('inquiries').insert(...)` 字段 employer_id, worker_id, message ✅

### ✅ employer-app/src/app/profile/page.tsx
- **Interface Employer**：id, contact_name, company_name, phone, district — 与 `employers` 表完全对齐 ✅
- **查询** `.from('employers').select('id, contact_name, company_name, phone, district')` ✅
- **查询** `.from('employers').update(...)` 字段完全匹配 ✅

### ✅ employer-app/src/app/signup/page.tsx
- **查询** `.from('employers').insert(...)` 字段：user_id, contact_name, company_name, phone, district ✅
- **查询** `.from('user_roles').insert(...)` 字段：user_id, role ✅

### ✅ src/app/feed/page.tsx（worker-app）
- **Interface FeedItem**：字段与 `get_feed` RPC 返回值完全对齐 ✅
- **查询** `.rpc('get_feed', { p_user_id })` 参数正确 ✅
- **查询** `.from('media_likes').delete().eq('media_id',...).eq('user_id',...)` ✅
- **查询** `.from('media_likes').insert({ media_id, user_id })` ✅
- **查询** `.from('media_bookmarks').delete().eq('media_id',...).eq('user_id',...)` ✅
- **查询** `.from('media_bookmarks').insert({ media_id, user_id })` ✅

### ✅ src/app/workers/page.tsx（worker-app）
- **Interface Worker**：字段与 `workers` 表完全对齐 ✅
- **查询** `.from('workers').select(...)` 字段全部存在 ✅

### ✅ src/app/profile/page.tsx（worker-app）
- **Interface Worker**：包含 workers 表全部字段 ✅
- **Interface OverseasExp**：id, country, duration, display_order — 与 `worker_overseas_experience` 表完全对齐 ✅
- **Interface Duty**：所有字段与 `worker_previous_duties` 表完全对齐 ✅
- **Interface WorkerMedia**：id, url, storage_path, type, caption, created_at — 与 `worker_media` 表完全对齐 ✅
- **查询** `.from('workers').select('*')` ✅
- **查询** `.from('worker_overseas_experience').select('*')` ✅
- **查询** `.from('worker_previous_duties').select('*')` ✅
- **查询** `.from('worker_media').select('*')` ✅
- **查询** `.from('worker_media').insert(...)` 字段：worker_id, url, storage_path, type, caption ✅
- **查询** `.from('workers').update({ photo_url })` ✅
- **查询** `.from('worker_media').delete()` ✅

### ✅ src/app/worker/register/types.ts（worker-app）
- **WorkerFormData** 接口：所有字段名与 workers 表对齐 ✅
  - 使用 `remark` ✅
  - 不含 `contract_type`、`experience_hk_years` ✅
- **OverseasExp** 接口：country, duration — 与 `worker_overseas_experience` 表对齐 ✅
- **PreviousDuty (emptyDuty)**：所有字段与 `worker_previous_duties` 表对齐 ✅

### ✅ src/app/worker/register/page.tsx（worker-app）
- **查询** `.from('workers').insert(...)` 所有插入字段与 workers 表对齐 ✅
- **查询** `.from('worker_overseas_experience').insert(...)` 字段：worker_id, country, duration, display_order ✅
- **查询** `.from('worker_previous_duties').insert(...)` 所有字段与表对齐 ✅

### ✅ src/app/worker/edit/page.tsx（worker-app）
- **dbToForm()** 转换函数：所有读取的字段与数据库对齐 ✅
- **查询** `.from('workers').select('*')` ✅
- **查询** `.from('worker_overseas_experience').select('*')` ✅
- **查询** `.from('worker_previous_duties').select('*')` ✅
- **查询** `.from('workers').update(...)` 所有更新字段与表对齐 ✅
- **查询** `.from('worker_overseas_experience').delete()` + `.insert(...)` ✅
- **查询** `.from('worker_previous_duties').delete()` + `.insert(...)` ✅

---

## 三、未在代码中使用的表

| 表名 | 状态 |
|------|------|
| worker_bookmarks | ⚠️ 表已定义但**两个 app 均未使用**（前端无「收藏外傭」功能） |

> 这不是 bug，只是功能尚未实现。

---

## 四、总结

### 🎉 不匹配项数量：**0**

经过逐文件、逐字段核对，**两个 app 中所有 interface 定义和 Supabase 查询使用的字段名均与数据库 schema 完全一致**。

之前的修复（删除 `contract_type`、`experience_hk_years`，`remarks` → `remark`）已经正确应用到 `employer-app/src/app/workers/[id]/page.tsx`。

### 涉及核对的文件清单（共 10 个关键文件）

| 文件 | 结果 |
|------|------|
| employer-app/src/app/workers/page.tsx | ✅ 通过 |
| employer-app/src/app/workers/[id]/page.tsx | ✅ 通过 |
| employer-app/src/app/profile/page.tsx | ✅ 通过 |
| employer-app/src/app/signup/page.tsx | ✅ 通过 |
| src/app/feed/page.tsx | ✅ 通过 |
| src/app/workers/page.tsx | ✅ 通过 |
| src/app/profile/page.tsx | ✅ 通过 |
| src/app/worker/register/types.ts | ✅ 通过 |
| src/app/worker/register/page.tsx | ✅ 通过 |
| src/app/worker/edit/page.tsx | ✅ 通过 |

### 备注
- **无法连接 Supabase OpenAPI endpoint**（项目未配置 `.env.local` 文件），本次核对基于 SQL migration 文件作为权威来源。如需与线上数据库实时对比，需补充 `.env.local` 配置。
- `worker_bookmarks` 表已定义但前端尚未实现相关功能。
