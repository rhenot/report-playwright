import { test, expect } from '@playwright/test';

test.describe('Search Feature', () => {

  test('User can search content', async ({ page }) => {

    await page.goto('/');

    await page.click('[data-testid="search-button"]');

    await page.fill(
      'input[placeholder*="Search"]',
      'Ikatan Cinta'
    );

    await page.keyboard.press('Enter');

    await expect(
      page.locator('text=Ikatan Cinta')
    ).toBeVisible();
  });

});