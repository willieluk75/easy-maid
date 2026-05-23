import { test, expect } from '@playwright/test';
import { loginAsEmployer } from './helpers/auth';

test.describe('Phase 6 UX - Employer App', () => {
  test('middleware: 未登入 /bookmarks redirect to /signin', async ({ page }) => {
    await page.goto('/bookmarks');
    await page.waitForURL('**/signin**', { timeout: 5000 }).catch(() => {});
    expect(page.url()).toContain('/signin');
  });

  test('middleware: /workers 是公開的', async ({ page }) => {
    await page.goto('/workers');
    await expect(page.locator('h1')).toContainText('外傭列表');
  });

  test('workers 搜尋', async ({ page }) => {
    await loginAsEmployer(page);
    await page.goto('/workers');
    const searchInput = page.locator('input[placeholder*="搜尋"]');
    await expect(searchInput).toBeVisible();
  });

  test('通知頁面渲染', async ({ page }) => {
    await loginAsEmployer(page);
    await page.goto('/notifications');
    await expect(page.locator('h1', { hasText: '通知' })).toBeVisible();
  });
});
