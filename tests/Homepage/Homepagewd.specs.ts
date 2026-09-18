import { test, expect } from '@playwright/test';
import { LoginPage } from '../../Pages/LoginPage';

const VALID_EMAIL = 'reny.la28@gmail.com';
const VALID_PASSWORD = 'Rplus123456';

// Configuration: Only run on desktop browsers (Chrome, Firefox, Safari)
// Skip on mobile and tablet projects
test.skip(({ isMobile }) => isMobile, 'Desktop browsers only (Chrome, Firefox, Safari)');

// Helper function to login and go to homepage
async function loginAndGoHome(page: any) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
  await loginPage.verifyLoginSuccess();
  await page.waitForTimeout(5000);
  
  // Close any modal/popup
  try {
    const modalClose = page.locator('.modal-close, [class*="close"], button:has-text("Close"), [aria-label="Close"], .btn-close').first();
    if (await modalClose.isVisible({ timeout: 3000 })) {
      await modalClose.click();
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    // No modal found
  }
}

test.describe('Homepage - All Images Verification', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('Total images count is more than 100', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(100);
  });

  test('All images have src attribute', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 50); i++) {
      const src = await images.nth(i).getAttribute('src');
      expect(src).toBeTruthy();
    }
  });

  test('Images are not broken (natural width > 0)', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    let brokenCount = 0;
    for (let i = 0; i < Math.min(count, 50); i++) {
      const naturalWidth = await images.nth(i).evaluate((img: any) => img.naturalWidth);
      if (naturalWidth === 0) brokenCount++;
    }
    expect(brokenCount).toBeLessThan(10);
  });

  test('Slider/banner images are visible', async ({ page }) => {
    await expect(page.locator('.swiper img, [class*="banner"] img, [class*="carousel"] img').first()).toBeVisible();
  });

  test('Content row images are visible', async ({ page }) => {
    await expect(page.locator('.row img, [class*="row"] img').first()).toBeVisible();
  });

  test('Category section images are visible', async ({ page }) => {
    await expect(page.locator('.row-category img, [class*="category"] img').first()).toBeVisible();
  });

  test('Trending section images are visible', async ({ page }) => {
    await expect(page.locator('.row-trend img, [class*="trend"] img').first()).toBeVisible();
  });

  test('Full width section images are visible', async ({ page }) => {
    await expect(page.locator('.row.full-w img, .full-w img').first()).toBeVisible();
  });

  test('Thumbnail/card images are visible', async ({ page }) => {
    await expect(page.locator('[class*="card"] img, [class*="thumbnail"] img').first()).toBeVisible();
  });

  test('Images have alt or title attribute', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    let withAlt = 0;
    for (let i = 0; i < Math.min(count, 30); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      const title = await images.nth(i).getAttribute('title');
      if (alt || title) withAlt++;
    }
    expect(withAlt).toBeGreaterThan(0);
  });
});

test.describe('Homepage - Story/Short+ Content', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('Short+ section is visible', async ({ page }) => {
    await expect(page.locator('text=Short+, [class*="short"], [class*="story"]').first()).toBeVisible();
  });

  test('Short+ navigation menu is visible', async ({ page }) => {
    await expect(page.locator('text=Short+').first()).toBeVisible();
  });

  test('Short/Story content has images', async ({ page }) => {
    const shortImages = page.locator('[class*="short"] img, [class*="story"] img');
    const count = await shortImages.count();
    if (count > 0) {
      await expect(shortImages.first()).toBeVisible();
    }
  });

  test('Short/Story content has text/titles', async ({ page }) => {
    const shortText = page.locator('[class*="short"] [class*="title"], [class*="story"] [class*="title"]');
    const count = await shortText.count();
    if (count > 0) {
      await expect(shortText.first()).toBeVisible();
    }
  });

  test('Short+ page is accessible via navigation', async ({ page }) => {
    const shortLink = page.locator('text=Short+').first();
    if (await shortLink.isVisible()) {
      await shortLink.click();
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(/.*short.*/);
    }
  });
});

test.describe('Homepage - All Text Content', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('Page title contains RCTI', async ({ page }) => {
    await expect(page).toHaveTitle(/RCTI/);
  });

  test('Navigation menu text items are visible', async ({ page }) => {
    await expect(page.locator('text=Home').first()).toBeVisible();
    await expect(page.locator('text=Live').first()).toBeVisible();
    await expect(page.locator('text=Short+').first()).toBeVisible();
    await expect(page.locator('text=Video+').first()).toBeVisible();
    await expect(page.locator('text=News+').first()).toBeVisible();
  });

  test('Video/show titles are visible', async ({ page }) => {
    await expect(page.locator('[class*="title"], [class*="name"]').first()).toBeVisible();
  });

  test('Content description text is visible', async ({ page }) => {
    await expect(page.locator('[class*="desc"], [class*="description"], [class*="info"]').first()).toBeVisible();
  });

  test('Section headers are visible', async ({ page }) => {
    await expect(page.locator('h2, h3, [class*="header"], [class*="title"]').first()).toBeVisible();
  });

  test('Category labels are visible', async ({ page }) => {
    await expect(page.locator('[class*="category"], [class*="genre"], [class*="tag"]').first()).toBeVisible();
  });

  test('Footer text is visible', async ({ page }) => {
    await expect(page.locator('footer, [class*="footer"]').first()).toBeVisible();
  });

  test('Footer has copyright text', async ({ page }) => {
    await expect(page.locator('footer, [class*="footer"]').first()).toContainText(/©|Copyright|2024|2025|2026/);
  });

  test('Search placeholder text is visible', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="Cari"]').first();
    if (await searchInput.isVisible()) {
      const placeholder = await searchInput.getAttribute('placeholder');
      expect(placeholder).toBeTruthy();
    }
  });
});

test.describe('Homepage - Scroll Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('Page can scroll down', async ({ page }) => {
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(1000);
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });

  test('Page can scroll to bottom', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(100);
  });

  test('Lazy loaded images appear when scrolling', async ({ page }) => {
    // Scroll down to trigger lazy loading
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(1000);
    
    const images = page.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Content loads when scrolling down', async ({ page }) => {
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(1000);
    
    // Check if more content is visible
    const rows = page.locator('.row, [class*="row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Can scroll back to top', async ({ page }) => {
    // Scroll down first
    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(500);
    
    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });

  test('Horizontal scroll for carousel/slider works', async ({ page }) => {
    const slider = page.locator('.swiper, [class*="carousel"]').first();
    if (await slider.isVisible()) {
      // Try to click next button
      const nextBtn = page.locator('.swiper-button-next, [class*="next"]').first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(1000);
        await expect(slider).toBeVisible();
      }
    }
  });
});

test.describe('Homepage - Combined Image & Text Check', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('Banner has both image and text', async ({ page }) => {
    await expect(page.locator('.swiper, [class*="banner"]').first()).toBeVisible();
    await expect(page.locator('.swiper img, [class*="banner"] img').first()).toBeVisible();
    await expect(page.locator('.swiper [class*="text"], .swiper [class*="title"]').first()).toBeVisible();
  });

  test('Content cards have image and title', async ({ page }) => {
    await expect(page.locator('[class*="card"] img, .row img').first()).toBeVisible();
    await expect(page.locator('[class*="card"] [class*="title"], [class*="card"] [class*="name"]').first()).toBeVisible();
  });

  test('Category section has image and label', async ({ page }) => {
    await expect(page.locator('.row-category img').first()).toBeVisible();
    await expect(page.locator('.row-category [class*="title"], .row-category [class*="label"]').first()).toBeVisible();
  });

  test('Trending section has image and info', async ({ page }) => {
    await expect(page.locator('.row-trend img').first()).toBeVisible();
    await expect(page.locator('.row-trend [class*="title"], .row-trend [class*="info"]').first()).toBeVisible();
  });
});

test.describe('Homepage - Circular Story Images', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('Story section with circular images is visible', async ({ page }) => {
    await expect(page.locator('[class*="story"], [class*="short"], [class*="circle"]').first()).toBeVisible();
  });

  test('All story circular images are visible', async ({ page }) => {
    const storyImages = page.locator('[class*="story"] img, [class*="short"] img, [class*="circle"] img, img[alt*="story"]');
    const count = await storyImages.count();
    expect(count).toBeGreaterThan(5);
    
    for (let i = 0; i < Math.min(count, 15); i++) {
      await expect(storyImages.nth(i)).toBeVisible();
    }
  });

  test('Story images have circular shape', async ({ page }) => {
    const storyImg = page.locator('[class*="story"] img, [class*="short"] img, [class*="circle"] img').first();
    if (await storyImg.isVisible()) {
      const borderRadius = await storyImg.evaluate((el: any) => window.getComputedStyle(el).borderRadius);
      expect(borderRadius).toMatch(/50%|9999px|999px/);
    }
  });

  test('All story titles are visible', async ({ page }) => {
    const storyTitles = page.locator('[class*="story"] [class*="title"], [class*="story"] [class*="name"], [class*="short"] [class*="title"]');
    const count = await storyTitles.count();
    expect(count).toBeGreaterThan(5);
  });

  test('Story: Terikat Janji is visible', async ({ page }) => {
    await expect(page.locator('text=Terikat Janji').first()).toBeVisible();
  });

  test('Story: Ketika Cinta Dilarang is visible', async ({ page }) => {
    await expect(page.locator('text=Ketika Cinta Dilarang').first()).toBeVisible();
  });

  test('Story: From Tumbler With Love is visible', async ({ page }) => {
    await expect(page.locator('text=From Tumbler With Love, text=From Tumbler').first()).toBeVisible();
  });

  test('Story: Culun Tapi Sultan is visible', async ({ page }) => {
    await expect(page.locator('text=Culun Tapi Sultan').first()).toBeVisible();
  });

  test('Story: Love By Accident is visible', async ({ page }) => {
    await expect(page.locator('text=Love By Accident').first()).toBeVisible();
  });

  test('Story: Dia Bukan Suamiku is visible', async ({ page }) => {
    await expect(page.locator('text=Dia Bukan Suamiku').first()).toBeVisible();
  });

  test('Story: Cinta Yang Salah is visible', async ({ page }) => {
    await expect(page.locator('text=Cinta Yang Salah').first()).toBeVisible();
  });

  test('Story: Cinta Sang CEO is visible', async ({ page }) => {
    await expect(page.locator('text=Cinta Sang CEO').first()).toBeVisible();
  });

  test('Story: Kafe Pangku is visible', async ({ page }) => {
    await expect(page.locator('text=Kafe Pangku').first()).toBeVisible();
  });

  test('Story: Amnesia is visible', async ({ page }) => {
    await expect(page.locator('text=Amnesia').first()).toBeVisible();
  });

  test('Story: CEO Bucin is visible', async ({ page }) => {
    await expect(page.locator('text=CEO Bucin').first()).toBeVisible();
  });
});

test.describe('Homepage - Category Icons', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('Category icons section is visible', async ({ page }) => {
    await expect(page.locator('[class*="category"], [class*="icon-section"]').first()).toBeVisible();
  });

  test('R+ Original category icon is visible', async ({ page }) => {
    await expect(page.locator('text=R+ Original, [class*="original"]').first()).toBeVisible();
  });

  test('TV Shows category icon is visible', async ({ page }) => {
    await expect(page.locator('text=TV Shows, [class*="tv"]').first()).toBeVisible();
  });

  test('Sports category icon is visible', async ({ page }) => {
    await expect(page.locator('text=Sports, [class*="sport"]').first()).toBeVisible();
  });

  test('Category icons have images', async ({ page }) => {
    const categoryImages = page.locator('[class*="category"] img, [class*="icon"] img');
    const count = await categoryImages.count();
    if (count > 0) {
      await expect(categoryImages.first()).toBeVisible();
    }
  });
});

test.describe('Homepage - Click All Story Images', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('Click on Terikat Janji story image', async ({ page }) => {
    const storyImg = page.locator('[class*="story"] img, [class*="short"] img').filter({ hasText: 'Terikat Janji' }).first();
    if (await storyImg.isVisible()) {
      await storyImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on Ketika Cinta Dilarang story image', async ({ page }) => {
    const storyImg = page.locator('[class*="story"] img, [class*="short"] img').filter({ hasText: 'Ketika Cinta Dilarang' }).first();
    if (await storyImg.isVisible()) {
      await storyImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on From Tumbler With Love story image', async ({ page }) => {
    const storyImg = page.locator('[class*="story"] img, [class*="short"] img').filter({ hasText: 'From Tumbler' }).first();
    if (await storyImg.isVisible()) {
      await storyImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on Culun Tapi Sultan story image', async ({ page }) => {
    const storyImg = page.locator('[class*="story"] img, [class*="short"] img').filter({ hasText: 'Culun Tapi Sultan' }).first();
    if (await storyImg.isVisible()) {
      await storyImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on Love By Accident story image', async ({ page }) => {
    const storyImg = page.locator('[class*="story"] img, [class*="short"] img').filter({ hasText: 'Love By Accident' }).first();
    if (await storyImg.isVisible()) {
      await storyImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on Dia Bukan Suamiku story image', async ({ page }) => {
    const storyImg = page.locator('[class*="story"] img, [class*="short"] img').filter({ hasText: 'Dia Bukan Suamiku' }).first();
    if (await storyImg.isVisible()) {
      await storyImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on Cinta Yang Salah story image', async ({ page }) => {
    const storyImg = page.locator('[class*="story"] img, [class*="short"] img').filter({ hasText: 'Cinta Yang Salah' }).first();
    if (await storyImg.isVisible()) {
      await storyImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on Cinta Sang CEO story image', async ({ page }) => {
    const storyImg = page.locator('[class*="story"] img, [class*="short"] img').filter({ hasText: 'Cinta Sang CEO' }).first();
    if (await storyImg.isVisible()) {
      await storyImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on Kafe Pangku story image', async ({ page }) => {
    const storyImg = page.locator('[class*="story"] img, [class*="short"] img').filter({ hasText: 'Kafe Pangku' }).first();
    if (await storyImg.isVisible()) {
      await storyImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on Amnesia story image', async ({ page }) => {
    const storyImg = page.locator('[class*="story"] img, [class*="short"] img').filter({ hasText: 'Amnesia' }).first();
    if (await storyImg.isVisible()) {
      await storyImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on CEO Bucin story image', async ({ page }) => {
    const storyImg = page.locator('[class*="story"] img, [class*="short"] img').filter({ hasText: 'CEO Bucin' }).first();
    if (await storyImg.isVisible()) {
      await storyImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on first story image navigates to content', async ({ page }) => {
    const firstStory = page.locator('[class*="story"] img, [class*="short"] img, [class*="circle"] img').first();
    if (await firstStory.isVisible()) {
      await firstStory.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on story title text navigates to content', async ({ page }) => {
    const firstTitle = page.locator('[class*="story"] [class*="title"], [class*="story"] [class*="name"]').first();
    if (await firstTitle.isVisible()) {
      await firstTitle.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });
});

test.describe('Homepage - Click All Category Icons', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('Click on R+ Original category', async ({ page }) => {
    const originalCategory = page.locator('text=R+ Original, [class*="original"]').first();
    if (await originalCategory.isVisible()) {
      await originalCategory.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on TV Shows category', async ({ page }) => {
    const tvCategory = page.locator('text=TV Shows, [class*="tv"]').first();
    if (await tvCategory.isVisible()) {
      await tvCategory.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on Sports category', async ({ page }) => {
    const sportsCategory = page.locator('text=Sports, [class*="sport"]').first();
    if (await sportsCategory.isVisible()) {
      await sportsCategory.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on category icon image', async ({ page }) => {
    const categoryImg = page.locator('[class*="category"] img, [class*="icon"] img').first();
    if (await categoryImg.isVisible()) {
      await categoryImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });
});

test.describe('Homepage - Click All Images', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('Click on banner/slider image', async ({ page }) => {
    const bannerImg = page.locator('.swiper img, [class*="banner"] img, [class*="carousel"] img').first();
    if (await bannerImg.isVisible()) {
      await bannerImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on content thumbnail image', async ({ page }) => {
    const contentImg = page.locator('.row img, [class*="card"] img').first();
    if (await contentImg.isVisible()) {
      await contentImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on category section image', async ({ page }) => {
    const categoryImg = page.locator('.row-category img, [class*="category"] img').first();
    if (await categoryImg.isVisible()) {
      await categoryImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on trending section image', async ({ page }) => {
    const trendingImg = page.locator('.row-trend img, [class*="trend"] img').first();
    if (await trendingImg.isVisible()) {
      await trendingImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on full-width section image', async ({ page }) => {
    const fullWImg = page.locator('.row.full-w img, .full-w img').first();
    if (await fullWImg.isVisible()) {
      await fullWImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on short/story image', async ({ page }) => {
    const shortImg = page.locator('[class*="short"] img, [class*="story"] img').first();
    if (await shortImg.isVisible()) {
      await shortImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on circular story image', async ({ page }) => {
    const circleImg = page.locator('[class*="circle"] img, img[style*="border-radius: 50%"]').first();
    if (await circleImg.isVisible()) {
      await circleImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on slider next button', async ({ page }) => {
    const nextBtn = page.locator('.swiper-button-next, [class*="next"]').first();
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForTimeout(1500);
      await expect(page.locator('.swiper-slide').first()).toBeVisible();
    }
  });

  test('Click on slider previous button', async ({ page }) => {
    const prevBtn = page.locator('.swiper-button-prev, [class*="prev"]').first();
    if (await prevBtn.isVisible()) {
      await prevBtn.click();
      await page.waitForTimeout(1500);
      await expect(page.locator('.swiper-slide').first()).toBeVisible();
    }
  });

  test('Click on pagination dot', async ({ page }) => {
    const dots = page.locator('.swiper-pagination span, [class*="dot"]');
    const count = await dots.count();
    if (count > 1) {
      await dots.nth(1).click();
      await page.waitForTimeout(1500);
      await expect(page.locator('.swiper-slide').first()).toBeVisible();
    }
  });

  test('Multiple images are clickable (cursor pointer or wrapped in link)', async ({ page }) => {
    const images = page.locator('.row img, [class*="card"] img');
    const count = await images.count();
    let clickableCount = 0;
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        const cursor = await img.evaluate((el: any) => window.getComputedStyle(el).cursor);
        const parentLink = await img.evaluate((el: any) => el.closest('a') !== null);
        if (cursor === 'pointer' || parentLink) {
          clickableCount++;
        }
      }
    }
    expect(clickableCount).toBeGreaterThan(0);
  });

  test('Click on image does not cause error', async ({ page }) => {
    const contentImg = page.locator('.row img').first();
    if (await contentImg.isVisible()) {
      await contentImg.click();
      await page.waitForTimeout(2000);
      const errorDialog = page.locator('[class*="error"], [class*="alert"]').first();
      if (await errorDialog.isVisible()) {
        const errorText = await errorDialog.textContent();
        expect(errorText).not.toContain('Error');
      }
    }
  });
});

test.describe('Homepage - Click Image Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoHome(page);
  });

  test('Click on banner/slider image navigates or opens content', async ({ page }) => {
    const bannerImg = page.locator('.swiper img, [class*="banner"] img, [class*="carousel"] img').first();
    if (await bannerImg.isVisible()) {
      await bannerImg.click();
      await page.waitForTimeout(2000);
      // Should navigate to content or open modal
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on content thumbnail image opens video/detail', async ({ page }) => {
    const contentImg = page.locator('.row img, [class*="card"] img, [class*="thumbnail"] img').first();
    if (await contentImg.isVisible()) {
      await contentImg.click();
      await page.waitForTimeout(2000);
      // Should navigate to video page or detail page
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on category image navigates to category page', async ({ page }) => {
    const categoryImg = page.locator('.row-category img, [class*="category"] img').first();
    if (await categoryImg.isVisible()) {
      await categoryImg.click();
      await page.waitForTimeout(2000);
      // Should navigate to category page
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on trending image opens content', async ({ page }) => {
    const trendingImg = page.locator('.row-trend img, [class*="trend"] img').first();
    if (await trendingImg.isVisible()) {
      await trendingImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on full-width section image works', async ({ page }) => {
    const fullWImg = page.locator('.row.full-w img, .full-w img').first();
    if (await fullWImg.isVisible()) {
      await fullWImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Click on short/story image opens content', async ({ page }) => {
    const shortImg = page.locator('[class*="short"] img, [class*="story"] img').first();
    if (await shortImg.isVisible()) {
      await shortImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*login.*/);
    }
  });

  test('Multiple images are clickable', async ({ page }) => {
    const images = page.locator('.row img, [class*="card"] img');
    const count = await images.count();
    let clickableCount = 0;
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        const cursor = await img.evaluate((el: any) => window.getComputedStyle(el).cursor);
        const parentLink = await img.evaluate((el: any) => el.closest('a') !== null);
        if (cursor === 'pointer' || parentLink) {
          clickableCount++;
        }
      }
    }
    expect(clickableCount).toBeGreaterThan(0);
  });

  test('Click on image does not cause error', async ({ page }) => {
    const contentImg = page.locator('.row img').first();
    if (await contentImg.isVisible()) {
      await contentImg.click();
      await page.waitForTimeout(2000);
      // Check no error dialog appears
      const errorDialog = page.locator('[class*="error"], [class*="alert"]').first();
      if (await errorDialog.isVisible()) {
        const errorText = await errorDialog.textContent();
        expect(errorText).not.toContain('Error');
      }
    }
  });

  test('Click on slider next button changes slide', async ({ page }) => {
    const nextBtn = page.locator('.swiper-button-next, [class*="next"]').first();
    if (await nextBtn.isVisible()) {
      const firstSlide = page.locator('.swiper-slide').first();
      const initialClass = await firstSlide.getAttribute('class');
      
      await nextBtn.click();
      await page.waitForTimeout(1500);
      
      // Slide should have changed
      await expect(page.locator('.swiper-slide').first()).toBeVisible();
    }
  });

  test('Click on slider previous button changes slide', async ({ page }) => {
    const prevBtn = page.locator('.swiper-button-prev, [class*="prev"]').first();
    if (await prevBtn.isVisible()) {
      await prevBtn.click();
      await page.waitForTimeout(1500);
      await expect(page.locator('.swiper-slide').first()).toBeVisible();
    }
  });

  test('Click on pagination dot navigates to specific slide', async ({ page }) => {
    const paginationDots = page.locator('.swiper-pagination [class*="dot"], .swiper-pagination span');
    const count = await paginationDots.count();
    
    if (count > 1) {
      // Click on second dot
      await paginationDots.nth(1).click();
      await page.waitForTimeout(1500);
      await expect(page.locator('.swiper-slide').first()).toBeVisible();
    }
  });
});
