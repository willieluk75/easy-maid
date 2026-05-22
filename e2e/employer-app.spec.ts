import { test, expect } from '@playwright/test';
import { loginAsEmployer, getUserRole } from './helpers/auth';

test.describe('Employer App (localhost:3001)', () => {
  test('未登入訪問 / 應跳轉到 /signin', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/signin', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/signin/);
  });

  test('可以登入 employer 帳號', async ({ page }) => {
    await loginAsEmployer(page);
    await expect(page).toHaveURL(/\/workers/);
  });

  test('登入後 /workers 列表可見外傭', async ({ page }) => {
    await loginAsEmployer(page);
    await expect(page).toHaveURL(/\/workers/);
    await page.waitForSelector('img, [class*="card"], [class*="worker"]', { timeout: 10_000 });
  });
});

// ── Phase 2: 僱主角色系統 ──
test.describe('Phase 2 — 僱主角色系統', () => {
  test('新註冊 employer 帳號自動建立 employer role + employer 記錄', async ({ page }) => {
    const testEmail = `test-employer-${Date.now()}@test.com`;
    await page.goto('/signup');

    // 填寫僱主登記表單
    await page.locator('input[placeholder*="聯絡人"]').fill('測試僱主');
    await page.locator('input[placeholder*="公司"]').fill('測試公司');
    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill('Test1234');
    await page.locator('form button[type="submit"]').click();

    // 等待導向 /workers
    await page.waitForURL(/\/workers/, { timeout: 15_000 });

    // 用 API 驗證 user_roles 有 employer 記錄
    const role = await getUserRole(testEmail);
    expect(role).toBe('employer');
  });

  test('僱主可以查看自己的 profile', async ({ page }) => {
    await loginAsEmployer(page);
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile/);
    // 應該顯示僱主資料
    await page.waitForSelector('text=我的帳號', { timeout: 10_000 });
  });

  test('僱主可以登出', async ({ page }) => {
    await loginAsEmployer(page);
    await page.goto('/profile');
    // 點登出按鈕
    await page.locator('button:has-text("登出")').click();
    await page.waitForURL(/\/signin/, { timeout: 10_000 });
  });
});