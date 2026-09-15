import { test, expect } from '@playwright/test';

const menus = [
  'Home',
  'Explore',
  'Live TV',
  'News',
];

test.describe('Navigation Menu', () => {

  for (const menu of menus) {

    test(`Open menu ${menu}`, async ({ page }) => {

      await page.goto('/');

      await page.click(`text=${menu}`);

      await expect(page).toHaveURL(/.+/);
    });

  }

});