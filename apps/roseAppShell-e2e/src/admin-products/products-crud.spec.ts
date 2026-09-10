import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/admin-login';
import path from 'path';

test.setTimeout(120_000);

test.describe.serial('admin products CRUD', () => {
    const timestamp = Date.now();
    const originalTitle = `E2E Test Product ${timestamp}`;
    const updatedTitle = `E2E Updated Product ${timestamp}`;

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/products');
        await page.getByRole('heading', { name: 'Products' }).waitFor({ state: 'visible', timeout: 30_000 });
        await page.locator('app-data-table').waitFor({ state: 'visible', timeout: 30_000 });
    });

    test('creates a product with cover and gallery then deletes it', async ({ page }) => {
        await page.getByRole('button', { name: 'Add a new product' }).click();
        await page.waitForURL('/admin/products/create', { timeout: 10_000 });

        await expect(page.getByRole('heading', { name: 'Add new product' })).toBeVisible();

        await page.getByLabel('Title').fill(originalTitle);
        await page.getByRole('spinbutton', { name: 'Price' }).fill('150');
        await page.getByRole('spinbutton', { name: 'Stock' }).fill('20');

        const categorySelect = page.locator('form.product-form').getByRole('combobox').nth(1);
        await categorySelect.click();
        // Skip any placeholder and pick the first real category option.
        const options = page.locator('.p-select-option');
        await options.first().waitFor({ state: 'visible', timeout: 10_000 });
        const count = await options.count();
        const optionIndex = count > 1 ? 1 : 0;
        await options.nth(optionIndex).click();

        const coverInput = page.locator('#cover-upload');
        await coverInput.setInputFiles(
            path.join(__dirname, 'test-assets', 'test-image-1.jpg'),
        );

        const galleryInput = page.locator('#gallery-upload');
        await galleryInput.setInputFiles([
            path.join(__dirname, 'test-assets', 'test-image-2.jpg'),
            path.join(__dirname, 'test-assets', 'test-image-3.jpg'),
        ]);

        await page.getByRole('button', { name: 'Save' }).click();
        await page.waitForURL('/admin/products', { timeout: 20_000 });

        const productRow = page
            .locator('app-data-table tbody tr')
            .filter({ hasText: originalTitle });
        await expect(productRow).toBeVisible({ timeout: 15_000 });

        // Edit the created product.
        await productRow.getByRole('button', { name: 'Edit' }).click();
        await page.waitForURL(/\/admin\/products\/[^/]+\/edit/, { timeout: 10_000 });

        await page.getByLabel('Title').fill(updatedTitle);
        await page.getByRole('button', { name: 'Save' }).click();
        await page.waitForURL('/admin/products', { timeout: 20_000 });

        const updatedRow = page
            .locator('app-data-table tbody tr')
            .filter({ hasText: updatedTitle });
        await expect(updatedRow).toBeVisible({ timeout: 15_000 });

        // Delete the product to clean up.
        await updatedRow.getByRole('button', { name: 'Delete' }).click();
        const confirmDialog = page.getByRole('alertdialog');
        await confirmDialog.getByRole('button', { name: 'ADMIN.PRODUCTS.DELETE_CONFIRM_ACCEPT' }).click();

        await expect(updatedRow).toHaveCount(0, { timeout: 15_000 });
    });
});
