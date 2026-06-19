import { expect, test } from '@playwright/test';
import {
  createTestAccount,
  getResetTokenFromEmail,
  type TestAccount,
} from './helpers/auth-test-account';

test.describe.configure({ mode: 'serial' });

test.describe('Password reset UI', () => {
  let account: TestAccount;

  test.beforeAll(async () => {
    account = await createTestAccount();
  });

  test('forgot password sends reset email and shows success', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible({
      timeout: 30_000,
    });

    await page.getByText(/forgot your password/i).click();
    await expect(page).toHaveURL(/\/auth\/forgot-password/);
    await expect(page.getByRole('heading', { name: /forgot password/i })).toBeVisible();

    await page.locator('input[type="email"]').fill(account.email);
    await page.locator('input[type="email"]').dispatchEvent('input');
    await page.getByRole('button', { name: /send reset link/i }).click();

    await expect(page).toHaveURL(/\/auth\/forgot-password\/sent/);
    await expect(page.getByRole('heading', { name: /check your email/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/reset link has been sent/i)).toBeVisible();
  });

  test('email reset link opens reset page and updates password', async ({ page }) => {
    test.setTimeout(90_000);

    const token = await getResetTokenFromEmail(account.mailToken);
    const newPassword = 'UiReset789!';

    await page.goto(`/reset-password?token=${token}`);
    await expect(page).toHaveURL(/\/auth\/reset-password\?token=/);
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible({
      timeout: 30_000,
    });

    const passwordInputs = page.locator('p-password input');
    await passwordInputs.nth(0).fill(newPassword);
    await passwordInputs.nth(1).fill(newPassword);
    await passwordInputs.nth(0).dispatchEvent('input');
    await passwordInputs.nth(1).dispatchEvent('input');
    await page.getByRole('button', { name: /^reset password$/i }).click();

    await expect(page.getByText(/password has been reset/i)).toBeVisible({ timeout: 15_000 });

    await page.getByText(/back to login/i).click();
    await expect(page).toHaveURL(/\/auth\/login/);

    await page.getByRole('textbox', { name: /enter your username/i }).fill(account.username);
    await page.getByRole('textbox', { name: /enter your username/i }).dispatchEvent('input');
    const loginPassword = page.locator('p-password input').first();
    await loginPassword.fill(newPassword);
    await loginPassword.dispatchEvent('input');
    await page.getByRole('button', { name: /^login$/i }).click();

    // Login stores session; app navigates to /home (remote may be unavailable in local e2e).
    await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 15_000 });
    account.password = newPassword;
  });
});
