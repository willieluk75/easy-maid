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

-- 5. 修正 user_roles RLS: 避免無限遞迴
-- 原先的 admin policy 會 self-reference user_roles 導致 42P17
-- 改用: 所有已登入用戶可讀取 user_roles (role 不是敏感資訊)
DROP POLICY IF EXISTS "Admin can view all roles" ON user_roles;
CREATE POLICY "Authenticated users can view all roles"
  ON user_roles FOR SELECT
  USING (auth.role() = 'authenticated');

-- 6. Admin 可讀取所有 worker_overseas_experience
CREATE POLICY "Admin can view all overseas experience"
  ON worker_overseas_experience FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 7. Admin 可讀取所有 worker_previous_duties
CREATE POLICY "Admin can view all previous duties"
  ON worker_previous_duties FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 8. Admin 可讀取所有 worker_media
CREATE POLICY "Admin can view all media"
  ON worker_media FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
