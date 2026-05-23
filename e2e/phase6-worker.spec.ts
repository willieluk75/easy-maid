import { test, expect } from '@playwright/test';
import { loginAsWorker } from './helpers/auth';

test.describe('Phase 6 UX - Worker App', () => {
  test('middleware: 未登入 /profile redirect to /signin', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForURL('**/signin**', { timeout: 5000 }).catch(() => {});
    expect(page.url()).toContain('/signin');
  });

  test('middleware: /workers 是公開的', async ({ page }) => {
    await page.goto('/workers');
    await expect(page.locator('h1')).toContainText('外傭列表');
  });

  test('workers 搜尋按姓名過濾', async ({ page }) => {
    await loginAsWorker(page);
    await page.goto('/workers');
    const searchInput = page.locator('input[placeholder*="搜尋"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Elena');
    await page.waitForTimeout(500);
    const items = page.locator('a[href*="/workers/"]');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });

  test('feed skeleton 載入', async ({ page }) => {
    await loginAsWorker(page);
    await page.goto('/feed');
    await expect(page.locator('article').first()).toBeVisible({ timeout: 10000 });
  });

  test('feed 評論 toggle', async ({ page }) => {
    await loginAsWorker(page);
    await page.goto('/feed');
    await expect(page.locator('article').first()).toBeVisible({ timeout: 10000 });
    const commentBtn = page.locator('button:has-text("查看留言")').first();
    if (await commentBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await commentBtn.click();
      await expect(page.locator('input[placeholder*="留言"]').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('通知頁面渲染', async ({ page }) => {
    await loginAsWorker(page);
    await page.goto('/notifications');
    await expect(page.locator('h1', { hasText: '通知' })).toBeVisible();
  });

  test('profile 封面照片按鈕', async ({ page }) => {
    await loginAsWorker(page);
    await page.goto('/profile');
    await page.waitForTimeout(3000);
    const bannerBtn = page.locator('button:has-text("上傳封面"), button:has-text("更換封面")').first();
    await expect(bannerBtn).toBeVisible({ timeout: 15000 });
  });

  test('SEO: workers page title', async ({ page }) => {
    await page.goto('/workers');
    const title = await page.title();
    expect(title).toContain('外傭列表');
  });

  test('SEO: feed page title', async ({ page }) => {
    await loginAsWorker(page);
    await page.goto('/feed');
    const title = await page.title();
    expect(title).toContain('動態');
  });
});
