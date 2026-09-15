import { test, expect } from '@playwright/test';

test.describe('Live TV Regression', () => {

  test('RCTI live streaming accessible', async ({ page }) => {

    await page.goto('/tv/rcti');

    await expect(
      page.locator('video')
    ).toBeVisible();
  });

});