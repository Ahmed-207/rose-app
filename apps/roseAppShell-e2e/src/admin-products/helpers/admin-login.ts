import { Page } from '@playwright/test';

export interface AdminCredentials {
    username: string;
    password: string;
}

export function getAdminCredentials(): AdminCredentials {
    const username = process.env['ADMIN_USER'];
    const password = process.env['ADMIN_PASSWORD'];

    if (!username || !password) {
        throw new Error(
            'ADMIN_USER and ADMIN_PASSWORD environment variables are required. See .env.example.',
        );
    }

    return { username, password };
}

export async function loginAsAdmin(page: Page): Promise<void> {
    const { username, password } = getAdminCredentials();

    await page.goto('/auth/login');

    // The auth remote is loaded lazily; wait for the form controls to render.
    const usernameInput = page.locator('input[type="text"]').or(page.getByLabel('Username'));
    await usernameInput.waitFor({ state: 'visible', timeout: 20_000 });
    await usernameInput.fill(username);

    const passwordInput = page.locator('input[type="password"]').or(page.getByLabel('Password'));
    await passwordInput.fill(password);

    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for post-login navigation to a protected route (not the login page).
    await page.waitForURL(/\/(home|admin)/, { timeout: 20_000 });
}
