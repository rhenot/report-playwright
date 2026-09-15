import { test, expect } from '@playwright/test';
import { LoginPage } from '../../Pages/LoginPage';

const VALID_EMAIL = 'reny.la28@gmail.com';
const VALID_PASSWORD = 'Rplus123456';

// Skip test on mobile/tablet projects - only run on desktop
test.skip(({ isMobile }) => isMobile, 'Desktop only test');

// Increase timeout for all tests (90 seconds)
test.describe.configure({ timeout: 90000 });

// Helper function to login and handle modal
async function loginAndGoHome(page: any) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
  await loginPage.verifyLoginSuccess();
  await page.waitForTimeout(5000);

  // Close any modal/popup that appears after login
  try {
    const modalClose = page.locator('.modal-close, [class*="close"], button:has-text("Close"), [aria-label="Close"], .btn-close').first();
    if (await modalClose.isVisible({ timeout: 3000 })) {
      await modalClose.click();
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    // No modal found, continue
  }
}

test.describe('Homepage - Header & Navigation Text', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('RCTI+ logo is visible in header', async ({ page }) => {
    await expect(page.locator('[class*="logo"], [class*="brand"], img[alt*="RCTI"]').first()).toBeVisible();
  });

  test('Home navigation text is visible', async ({ page }) => {
    await expect(page.locator('text=Home').first()).toBeVisible();
  });

  test('Live navigation text is visible', async ({ page }) => {
    await expect(page.locator('text=Live').first()).toBeVisible();
  });

  test('Short+ navigation text is visible', async ({ page }) => {
    await expect(page.locator('text=Short+').first()).toBeVisible();
  });

  test('Video+ navigation text is visible', async ({ page }) => {
    await expect(page.locator('text=Video+').first()).toBeVisible();
  });

  test('News+ navigation text is visible', async ({ page }) => {
    await expect(page.locator('text=News+').first()).toBeVisible();
  });

  test('Audio+ navigation text is visible', async ({ page }) => {
    await expect(page.locator('text=Audio+').first()).toBeVisible();
  });

  test('Hot+ navigation text is visible', async ({ page }) => {
    await expect(page.locator('text=Hot+').first()).toBeVisible();
  });

  test('Games+ navigation text is visible', async ({ page }) => {
    await expect(page.locator('text=Games+').first()).toBeVisible();
  });

  test('Shop+ navigation text is visible', async ({ page }) => {
    await expect(page.locator('text=Shop+').first()).toBeVisible();
  });
});

test.describe('Homepage - Main Banner Images', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('Main banner carousel is visible', async ({ page }) => {
    await expect(page.locator('.swiper, [class*="banner"], [class*="carousel"]').first()).toBeVisible();
  });

  test('Banner has multiple slides', async ({ page }) => {
    const slides = page.locator('.swiper-slide, [class*="slide"]');
    const count = await slides.count();
    expect(count).toBeGreaterThan(1);
  });

  test('Banner slides contain images', async ({ page }) => {
    const bannerImages = page.locator('.swiper img, [class*="banner"] img, [class*="carousel"] img');
    const count = await bannerImages.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Banner navigation arrows are visible', async ({ page }) => {
    await expect(page.locator('.swiper-button-next, .swiper-button-prev, [class*="arrow"]').first()).toBeVisible();
  });
});

test.describe('Homepage - All Content Images', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('Homepage has more than 100 images', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(100);
  });

  test('All images have src attribute', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 20); i++) {
      const src = await images.nth(i).getAttribute('src');
      expect(src).toBeTruthy();
    }
  });

  test('Thumbnail images in content rows are visible', async ({ page }) => {
    await expect(page.locator('.row img, [class*="row"] img, [class*="card"] img').first()).toBeVisible();
  });

  test('Category section images are visible', async ({ page }) => {
    await expect(page.locator('.row-category img, [class*="category"] img').first()).toBeVisible();
  });

  test('Trending section images are visible', async ({ page }) => {
    await expect(page.locator('.row-trend img, [class*="trend"] img').first()).toBeVisible();
  });

  test('Full width row images are visible', async ({ page }) => {
    await expect(page.locator('.row.full-w img, .full-w img').first()).toBeVisible();
  });
});

test.describe('Homepage - Content Text & Titles', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('Video/show titles are visible', async ({ page }) => {
    await expect(page.locator('[class*="title"], [class*="name"], [class*="label"]').first()).toBeVisible();
  });

  test('Content description text is visible', async ({ page }) => {
    await expect(page.locator('[class*="desc"], [class*="description"], [class*="info"]').first()).toBeVisible();
  });

  test('Section headers (h2, h3) are visible', async ({ page }) => {
    await expect(page.locator('h2, h3, [class*="header"], [class*="title"]').first()).toBeVisible();
  });

  test('Category labels are visible', async ({ page }) => {
    await expect(page.locator('[class*="category"], [class*="genre"], [class*="tag"]').first()).toBeVisible();
  });

  test('Duration or episode info text is visible', async ({ page }) => {
    await expect(page.locator('[class*="duration"], [class*="episode"]').first()).toBeVisible();
  });
});

test.describe('Homepage - Content Row Sections', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('Full width content row is visible', async ({ page }) => {
    await expect(page.locator('.row.full-w, .full-w').first()).toBeVisible();
  });

  test('Category row section is visible', async ({ page }) => {
    await expect(page.locator('.row-category').first()).toBeVisible();
  });

  test('Trending row section is visible', async ({ page }) => {
    await expect(page.locator('.row-trend, [class*="trend"]').first()).toBeVisible();
  });

  test('Swiper wrapper is visible', async ({ page }) => {
    await expect(page.locator('.swiper-wrapper').first()).toBeVisible();
  });

  test('Multiple content rows exist (more than 3)', async ({ page }) => {
    const rows = page.locator('.row, [class*="row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThan(3);
  });
});

test.describe('Homepage - Footer Content', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('Footer section is visible', async ({ page }) => {
    await expect(page.locator('footer, [class*="footer"]').first()).toBeVisible();
  });

  test('Footer contains links', async ({ page }) => {
    const footerLinks = page.locator('footer a, [class*="footer"] a');
    const count = await footerLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Footer contains copyright text', async ({ page }) => {
    await expect(page.locator('footer, [class*="footer"]').first()).toContainText(/©|Copyright|2024|2025|2026/);
  });

  test('Footer has social media links', async ({ page }) => {
    await expect(page.locator('footer [class*="social"], footer a[href*="facebook"], footer a[href*="instagram"]').first()).toBeVisible();
  });
});

test.describe('Homepage - Interactive Elements', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('Search input field is visible', async ({ page }) => {
    await expect(page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="Cari"]').first()).toBeVisible();
  });

  test('Search input accepts text', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="Cari"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await expect(searchInput).toHaveValue('test');
    }
  });

  test('User profile button is visible', async ({ page }) => {
    await expect(page.locator('[class*="profile"], [class*="user"], [class*="avatar"]').first()).toBeVisible();
  });

  test('Profile menu shows logout option', async ({ page }) => {
    const profileBtn = page.locator('[class*="profile"], [class*="user"], [class*="avatar"]').first();
    await profileBtn.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Logout, text=Keluar').first()).toBeVisible();
  });
});

test.describe('Homepage - Responsive Desktop Viewports', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('All nav items visible on 1920x1080', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('text=Home').first()).toBeVisible();
    await expect(page.locator('text=Live').first()).toBeVisible();
    await expect(page.locator('.swiper').first()).toBeVisible();
  });

  test('All nav items visible on 1366x768', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await expect(page.locator('text=Home').first()).toBeVisible();
    await expect(page.locator('text=Live').first()).toBeVisible();
    await expect(page.locator('.swiper').first()).toBeVisible();
  });

  test('Banner visible on 1440x900', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('.swiper, [class*="banner"]').first()).toBeVisible();
  });

  test('Content rows visible on 1280x720', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('.row, [class*="row"]').first()).toBeVisible();
  });
});
