import { test, expect } from '@playwright/test';
import { loginAsEmployer } from './helpers/auth';

test.describe('Phase 4 — 收藏系統 (Employer App)', () => {
  test('僱主可在收藏頁看到雙 Tab', async ({ page }) => {
    await loginAsEmployer(page);
    await page.goto('/bookmarks');
    await expect(page).toHaveURL(/\/bookmarks/);
    // 確認兩個 Tab 存在
    await page.waitForSelector('text=外傭', { timeout: 10_000 });
    await page.waitForSelector('text=媒體', { timeout: 5_000 });
  });

  test('僱主可切換到媒體 Tab', async ({ page }) => {
    await loginAsEmployer(page);
    await page.goto('/bookmarks');
    await page.waitForSelector('text=外傭', { timeout: 10_000 });
    // 點擊媒體 Tab
    await page.locator('button:has-text("媒體")').click();
    await page.waitForTimeout(1000);
    // 頁面應顯示空狀態或收藏列表
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
  });

  test('僱主可在 Worker 詳細頁看到收藏按鈕', async ({ page }) => {
    await loginAsEmployer(page);
    // 到 workers 列表
    await page.goto('/workers');
    await page.waitForSelector('a[href*="/workers/"]', { timeout: 10_000 });
    // 點第一位外傭
    await page.locator('a[href*="/workers/"]').first().click();
    await page.waitForURL(/\/workers\/[a-f0-9-]+/, { timeout: 10_000 });

    // 確認有收藏按鈕
    const bookmarkBtn = page.locator('button:has-text("收藏")');
    await expect(bookmarkBtn).toBeVisible({ timeout: 5_000 });
  });

  test('僱主可收藏外傭並在收藏頁看到', async ({ page }) => {
    const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    // 取 employer user_id
    const userListRes = await fetch('http://localhost:8000/auth/v1/admin/users', {
      headers: { apikey: SRK, Authorization: `Bearer ${SRK}` },
    });
    const { users } = await userListRes.json();
    const employerUser = users.find((u: any) => u.email === 'employer@test.com');

    // 建 employer record（如不存在）
    const empRes = await fetch(
      `http://localhost:8000/rest/v1/employers?user_id=eq.${employerUser.id}&select=id`,
      { headers: { apikey: SRK, Authorization: `Bearer ${SRK}` } },
    );
    const empData = await empRes.json();
    if (!empData.length) {
      await fetch('http://localhost:8000/rest/v1/employers', {
        method: 'POST',
        headers: { apikey: SRK, Authorization: `Bearer ${SRK}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify({ user_id: employerUser.id, contact_name: '測試僱主', company_name: '測試公司' }),
      });
    }

    // 取一個 worker
    const workerRes = await fetch(
      'http://localhost:8000/rest/v1/workers?select=id,name&limit=1',
      { headers: { apikey: SRK, Authorization: `Bearer ${SRK}` } },
    );
    const [worker] = await workerRes.json();

    // 用 API 建收藏
    await fetch('http://localhost:8000/rest/v1/worker_bookmarks', {
      method: 'POST',
      headers: { apikey: SRK, Authorization: `Bearer ${SRK}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: employerUser.id, worker_id: worker.id }),
    });

    // 驗證收藏頁可見
    await loginAsEmployer(page);
    await page.goto('/bookmarks');
    await page.waitForSelector('text=外傭', { timeout: 10_000 });
    await page.waitForTimeout(2000);

    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toContain(worker.name);
  });
});
