import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/admin-login';

test.setTimeout(90_000);

test.describe('admin products list', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/products');
        await page.getByRole('heading', { name: 'Products' }).waitFor({ state: 'visible', timeout: 30_000 });
        await page.locator('app-data-table').waitFor({ state: 'visible', timeout: 30_000 });
    });

    test('renders translated headers and table', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

        const table = page.locator('app-data-table');
        await expect(table.getByRole('columnheader', { name: 'Name' })).toBeVisible();
        await expect(table.getByRole('columnheader', { name: 'Price' })).toBeVisible();
        await expect(table.getByRole('columnheader', { name: 'Stock' })).toBeVisible();
        await expect(table.getByRole('columnheader', { name: 'Sales' })).toBeVisible();
        await expect(table.getByRole('columnheader', { name: 'Ratings' })).toBeVisible();
        await expect(table.getByRole('columnheader', { name: 'Created At' })).toBeVisible();
        await expect(table.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
    });

    test('filters by category and updates URL', async ({ page }) => {
        const categorySelect = page.getByRole('combobox', { name: 'All categories' });
        await categorySelect.click();

        const options = page.locator('.p-select-option');
        await options.first().waitFor({ state: 'visible', timeout: 10_000 });
        const count = await options.count();
        // option 0 is usually "All categories"; pick the first real category if any.
        const optionIndex = count > 1 ? 1 : 0;
        await options.nth(optionIndex).click();

        await page.waitForURL(/categoryId=/, { timeout: 15_000 });
        await expect(page.locator('app-data-table tbody tr').first()).toBeVisible();
    });

    test('sorts by column and resets to page 1', async ({ page }) => {
        // Navigate to page 2 first if possible to verify sort resets page.
        const page2 = page.locator('.p-paginator-page').filter({ hasText: '2' });
        if ((await page2.count()) > 0 && (await page2.isEnabled())) {
            await page2.click();
            await page.waitForURL(/page=2/, { timeout: 10_000 });
        }

        await page.getByRole('columnheader', { name: 'Price' }).click();
        await page.waitForURL(/sortBy=price/, { timeout: 10_000 });
        expect(page.url()).not.toContain('page=2');
    });

    test('changes rows per page and keeps active page styled', async ({ page }) => {
        const rowsSelect = page.getByRole('combobox', { name: 'Rows per page' });
        await rowsSelect.click();

        await page.locator('.p-select-option', { hasText: '25' }).click();
        await page.waitForURL(/limit=25/, { timeout: 10_000 });

        // Wait for the table to finish reloading with the new page size.
        await page.locator('app-data-table tbody tr').first().waitFor({ state: 'visible', timeout: 15_000 });

        const activePage = page.locator('.p-paginator-page-selected, .p-paginator-page.p-highlight').first();
        await expect(activePage).toBeVisible();

        const activeColor = await activePage.evaluate((el) =>
            window.getComputedStyle(el).backgroundColor,
        );
        // #741C21 in RGB
        expect(activeColor).toBe('rgb(116, 28, 33)');
    });
});
