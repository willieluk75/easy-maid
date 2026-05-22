import { Page, expect } from '@playwright/test';

/**
 * Shared auth helpers for Easy Maid E2E tests.
 *
 * All helpers navigate to the correct signin page, fill credentials,
 * submit, and wait for navigation away from /signin.
 */

/* ------------------------------------------------------------------ */
/*  Worker App (localhost:3000)                                        */
/* ------------------------------------------------------------------ */

export async function loginAsWorker(page: Page) {
  await page.goto('/signin');
  await page.locator('input[name="email"]').fill('worker@test.com');
  await page.locator('input[name="password"]').fill('test1234');
  await page.locator('form').locator('button[type="submit"]').click();
  // Worker app redirects to /profile after login
  await page.waitForURL((url) => !url.pathname.endsWith('/signin'), {
    timeout: 15_000,
  });
}

export async function loginAsAdmin(page: Page) {
  await page.goto('/signin');
  await page.locator('input[name="email"]').fill('admin@test.com');
  await page.locator('input[name="password"]').fill('test1234');
  await page.locator('form').locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.endsWith('/signin'), {
    timeout: 15_000,
  });
}

/* ------------------------------------------------------------------ */
/*  Employer App (localhost:3001)                                      */
/* ------------------------------------------------------------------ */

export async function loginAsEmployer(page: Page) {
  await page.goto('/signin');
  await page.locator('input[name="email"]').fill('employer@test.com');
  await page.locator('input[name="password"]').fill('test1234');
  await page.locator('form').locator('button[type="submit"]').click();
  // Employer app redirects to /workers after login
  await page.waitForURL((url) => !url.pathname.endsWith('/signin'), {
    timeout: 15_000,
  });
}

/* ------------------------------------------------------------------ */
/*  DB verification helpers                                            */
/* ------------------------------------------------------------------ */

const SUPABASE_URL = 'http://localhost:8000';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Look up a user_id by email via Admin API, then check user_roles.
 * Returns the role string or null.
 */
export async function getUserRole(email: string): Promise<string | null> {
  // Get user list and find by email
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });
  const { users } = await res.json();
  const user = users?.find((u: any) => u.email === email);
  if (!user) return null;

  // Check user_roles
  const roleRes = await fetch(
    `${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${user.id}&select=role`,
    {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    },
  );
  const rows = await roleRes.json();
  return rows?.[0]?.role ?? null;
}
