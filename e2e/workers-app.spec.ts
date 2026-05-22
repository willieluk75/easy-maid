import { test, expect } from '@playwright/test';
import { loginAsWorker, loginAsAdmin, getUserRole } from './helpers/auth';

test.describe('Worker App (localhost:3000)', () => {
  test('未登入訪問 / 應跳轉到 /signin', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/signin', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/signin/);
  });

  test('可以登入 worker 帳號', async ({ page }) => {
    await loginAsWorker(page);
    await expect(page).toHaveURL(/\/profile/);
  });

  test('登入後 /feed 頁面可見動態', async ({ page }) => {
    await loginAsWorker(page);
    await page.goto('/feed');
    await expect(page).toHaveURL(/\/feed/);
    await page.waitForSelector('img, [class*="card"], [class*="feed"]', { timeout: 10_000 });
  });

  test('/workers 列表頁可見外傭', async ({ page }) => {
    await loginAsWorker(page);
    await page.goto('/workers');
    await expect(page).toHaveURL(/\/workers/);
    await page.waitForSelector('img, [class*="card"], [class*="worker"]', { timeout: 10_000 });
  });
});

// ── Phase 2: 角色系統 ──
test.describe('Phase 2 — 角色系統', () => {
  test('新註冊 worker 帳號自動建立 worker role', async ({ page }) => {
    const testEmail = `test-worker-${Date.now()}@test.com`;
    await page.goto('/signup');

    // 填寫註冊表單
    await page.locator('input[name="email"]').fill(testEmail);
    await page.locator('input[name="password"]').fill('Test1234');
    await page.locator('input[name="confirmPassword"]').fill('Test1234');
    await page.locator('form button[type="submit"]').click();

    // 等待導向 profile（autoconfirm 已開啟）
    await page.waitForURL(/\/profile/, { timeout: 15_000 });

    // 用 API 驗證 user_roles 有 worker 記錄
    const role = await getUserRole(testEmail);
    expect(role).toBe('worker');
  });

  test('admin 帳號可以登入', async ({ page }) => {
    await loginAsAdmin(page);
    // Admin 登入後也會去 /profile
    await expect(page).toHaveURL(/\/profile|\/admin/);
  });
});