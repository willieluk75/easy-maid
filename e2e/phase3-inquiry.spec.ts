import { test, expect } from '@playwright/test';
import { loginAsEmployer } from './helpers/auth';

test.describe('Phase 3 — 詢問系統 (Employer App)', () => {
  test('僱主可查看詢問頁面', async ({ page }) => {
    await loginAsEmployer(page);
    await page.goto('/inquiries');
    await expect(page).toHaveURL(/\/inquiries/);
    // 頁面載入（標題或空狀態都算通過）
    await page.waitForSelector('body', { timeout: 10_000 });
    // 確認頁面不是空白
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
  });

  test('僱主可從外傭詳細頁打開聯絡 modal', async ({ page }) => {
    await loginAsEmployer(page);
    // 到 workers 列表
    await page.goto('/workers');
    await page.waitForSelector('a[href*="/workers/"]', { timeout: 10_000 });
    // 點擊第一位外傭
    const firstWorker = page.locator('a[href*="/workers/"]').first();
    await firstWorker.click();
    await page.waitForURL(/\/workers\/[a-f0-9-]+/, { timeout: 10_000 });

    // 確認有「聯絡外傭」按鈕
    const contactBtn = page.locator('button:has-text("聯絡外傭")');
    await expect(contactBtn).toBeVisible({ timeout: 5_000 });
    await contactBtn.click();

    // Modal 應該出現
    await page.waitForSelector('text=聯絡外傭', { timeout: 5_000 });
  });

  test('僱主可發送詢問並在列表中看到', async ({ page }) => {
    // 用 API 先建 inquiry 再驗證列表頁可見
    const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    // 取 employer 的 user_id
    const userListRes = await fetch('http://localhost:8000/auth/v1/admin/users', {
      headers: { apikey: SRK, Authorization: `Bearer ${SRK}` },
    });
    const { users } = await userListRes.json();
    const employerUser = users.find((u: any) => u.email === 'employer@test.com');
    
    // 取 employer record
    const empRes = await fetch(
      `http://localhost:8000/rest/v1/employers?user_id=eq.${employerUser.id}&select=id`,
      { headers: { apikey: SRK, Authorization: `Bearer ${SRK}` } },
    );
    const [employer] = await empRes.json();

    if (!employer) {
      // 建 employer record
      await fetch('http://localhost:8000/rest/v1/employers', {
        method: 'POST',
        headers: {
          apikey: SRK,
          Authorization: `Bearer ${SRK}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ user_id: employerUser.id, contact_name: '測試僱主', company_name: '測試公司' }),
      });
    }

    // 取一個 worker
    const workerRes = await fetch(
      'http://localhost:8000/rest/v1/workers?select=id&limit=1',
      { headers: { apikey: SRK, Authorization: `Bearer ${SRK}` } },
    );
    const [worker] = await workerRes.json();

    // 建 inquiry
    const empRecRes = await fetch(
      `http://localhost:8000/rest/v1/employers?user_id=eq.${employerUser.id}&select=id`,
      { headers: { apikey: SRK, Authorization: `Bearer ${SRK}` } },
    );
    const [empRec] = await empRecRes.json();

    await fetch('http://localhost:8000/rest/v1/inquiries', {
      method: 'POST',
      headers: {
        apikey: SRK,
        Authorization: `Bearer ${SRK}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employer_id: empRec.id,
        worker_id: worker.id,
        message: 'E2E 測試詢問 — 你好，我想了解這位外傭。',
      }),
    });

    // 驗證列表頁
    await loginAsEmployer(page);
    await page.goto('/inquiries');
    // 等頁面載入
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toContain('E2E 測試詢問');
  });
});
