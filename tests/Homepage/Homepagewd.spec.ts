import { test, expect } from '@playwright/test';

test.describe('Homepage Regression', () => {

  test('Homepage loaded successfully', async ({ page }) => {

    await page.goto('/');

    await expect(page).toHaveTitle(/RCTI/);

    await expect(
      page.locator('img')
    ).toBeVisible();
  });

  test('Banner carousel visible', async ({ page }) => {

    await page.goto('/');

    await expect(
      page.locator('.swiper')
    ).toBeVisible();

  });

});