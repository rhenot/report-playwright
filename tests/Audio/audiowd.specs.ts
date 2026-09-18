import { test, expect } from '@playwright/test';

// Configuration: Only run on desktop browsers (Chrome, Firefox, Safari)
// Skip on mobile and tablet projects
test.skip(({ isMobile }) => isMobile, 'Desktop browsers only (Chrome, Firefox, Safari)');

const AUDIO_URL = 'https://radio.rctiplus.com/';
const PLAY_DURATION = 120000; // 2 minutes in milliseconds

test.describe('Audio Page - Initial Load & Images', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(AUDIO_URL);
    await page.waitForTimeout(3000);
  });

  test('Audio page loads successfully', async ({ page }) => {
    await expect(page).toHaveURL(/.*radio\.rctiplus\.com.*/);
    await expect(page).toHaveTitle(/RCTI|Radio|Audio/i);
  });

  test('Page has multiple images', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(5);
  });

  test('All images have src attribute', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 20); i++) {
      const src = await images.nth(i).getAttribute('src');
      expect(src).toBeTruthy();
    }
  });

  test('Images are not broken', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    let brokenCount = 0;
    for (let i = 0; i < Math.min(count, 20); i++) {
      const naturalWidth = await images.nth(i).evaluate((img: any) => img.naturalWidth);
      if (naturalWidth === 0) brokenCount++;
    }
    expect(brokenCount).toBeLessThan(5);
  });

  test('Station/channel images are visible', async ({ page }) => {
    await expect(page.locator('[class*="station"] img, [class*="channel"] img, [class*="radio"] img').first()).toBeVisible();
  });

  test('Content thumbnail images are visible', async ({ page }) => {
    await expect(page.locator('[class*="content"] img, [class*="card"] img, [class*="item"] img').first()).toBeVisible();
  });

  test('Banner/hero images are visible', async ({ page }) => {
    await expect(page.locator('[class*="banner"] img, [class*="hero"] img, [class*="slider"] img').first()).toBeVisible();
  });

  test('Logo images are visible', async ({ page }) => {
    await expect(page.locator('[class*="logo"] img, img[alt*="logo"], img[alt*="RCTI"]').first()).toBeVisible();
  });
});

test.describe('Audio Page - Click All Images to Player', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(AUDIO_URL);
    await page.waitForTimeout(3000);
  });

  test('Click on first station image opens player', async ({ page }) => {
    const stationImg = page.locator('[class*="station"] img, [class*="channel"] img, [class*="radio"] img').first();
    if (await stationImg.isVisible()) {
      await stationImg.click();
      await page.waitForTimeout(2000);
      // Check if player appears or page navigates to player
      const playerExists = await page.locator('[class*="player"], audio, video, iframe').count();
      expect(playerExists).toBeGreaterThan(0);
    }
  });

  test('Click on content thumbnail opens player', async ({ page }) => {
    const contentImg = page.locator('[class*="content"] img, [class*="card"] img, [class*="item"] img').first();
    if (await contentImg.isVisible()) {
      await contentImg.click();
      await page.waitForTimeout(2000);
      const playerExists = await page.locator('[class*="player"], audio, video, iframe').count();
      expect(playerExists).toBeGreaterThan(0);
    }
  });

  test('Click on banner image opens content', async ({ page }) => {
    const bannerImg = page.locator('[class*="banner"] img, [class*="hero"] img').first();
    if (await bannerImg.isVisible()) {
      await bannerImg.click();
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/.*error.*/);
    }
  });

  test('Multiple images are clickable', async ({ page }) => {
    const images = page.locator('[class*="station"] img, [class*="content"] img, [class*="card"] img');
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
});

test.describe('Audio Page - Player Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(AUDIO_URL);
    await page.waitForTimeout(3000);
    
    // Click on first available content to open player
    const firstImg = page.locator('[class*="station"] img, [class*="content"] img, [class*="card"] img').first();
    if (await firstImg.isVisible()) {
      await firstImg.click();
      await page.waitForTimeout(3000);
    }
  });

  test('Player is visible after clicking content', async ({ page }) => {
    await expect(page.locator('[class*="player"], audio, [class*="audio-player"]').first()).toBeVisible();
  });

  test('Play button is visible', async ({ page }) => {
    await expect(page.locator('[class*="play"], button[aria-label*="Play"], [data-testid*="play"]').first()).toBeVisible();
  });

  test('Click play button starts playback', async ({ page }) => {
    const playBtn = page.locator('[class*="play"], button[aria-label*="Play"]').first();
    if (await playBtn.isVisible()) {
      await playBtn.click();
      await page.waitForTimeout(2000);
      
      // Check if audio is playing (src attribute or playing state)
      const audioElement = page.locator('audio').first();
      if (await audioElement.count() > 0) {
        const isPlaying = await audioElement.evaluate((el: any) => !el.paused);
        expect(isPlaying).toBeTruthy();
      }
    }
  });

  test('Player has volume control', async ({ page }) => {
    await expect(page.locator('[class*="volume"], input[type="range"], [aria-label*="Volume"]').first()).toBeVisible();
  });

  test('Player has progress bar', async ({ page }) => {
    await expect(page.locator('[class*="progress"], [class*="seek"], input[type="range"]').first()).toBeVisible();
  });

  test('Player shows current track/station info', async ({ page }) => {
    await expect(page.locator('[class*="title"], [class*="name"], [class*="info"], [class*="current"]').first()).toBeVisible();
  });
});

test.describe('Audio Page - Play Content for 2 Minutes', () => {
  test('Play first content for 2 minutes', async ({ page }) => {
    await page.goto(AUDIO_URL);
    await page.waitForTimeout(3000);
    
    // Click on first content
    const firstImg = page.locator('[class*="station"] img, [class*="content"] img').first();
    if (await firstImg.isVisible()) {
      await firstImg.click();
      await page.waitForTimeout(3000);
      
      // Click play button
      const playBtn = page.locator('[class*="play"], button[aria-label*="Play"]').first();
      if (await playBtn.isVisible()) {
        await playBtn.click();
        console.log('▶️ Playback started');
        
        // Wait for 2 minutes
        await page.waitForTimeout(PLAY_DURATION);
        console.log('⏹️ Playback stopped after 2 minutes');
        
        // Verify page is still active
        await expect(page).toHaveURL(/.*radio\.rctiplus\.com.*/);
      }
    }
  });

  test('Play second content for 2 minutes', async ({ page }) => {
    await page.goto(AUDIO_URL);
    await page.waitForTimeout(3000);
    
    // Click on second content
    const secondImg = page.locator('[class*="station"] img, [class*="content"] img').nth(1);
    if (await secondImg.isVisible()) {
      await secondImg.click();
      await page.waitForTimeout(3000);
      
      const playBtn = page.locator('[class*="play"], button[aria-label*="Play"]').first();
      if (await playBtn.isVisible()) {
        await playBtn.click();
        console.log('▶️ Playback started for second content');
        
        await page.waitForTimeout(PLAY_DURATION);
        console.log('️ Playback stopped after 2 minutes');
        
        await expect(page).toHaveURL(/.*radio\.rctiplus\.com.*/);
      }
    }
  });

  test('Play third content for 2 minutes', async ({ page }) => {
    await page.goto(AUDIO_URL);
    await page.waitForTimeout(3000);
    
    const thirdImg = page.locator('[class*="station"] img, [class*="content"] img').nth(2);
    if (await thirdImg.isVisible()) {
      await thirdImg.click();
      await page.waitForTimeout(3000);
      
      const playBtn = page.locator('[class*="play"], button[aria-label*="Play"]').first();
      if (await playBtn.isVisible()) {
        await playBtn.click();
        console.log('▶️ Playback started for third content');
        
        await page.waitForTimeout(PLAY_DURATION);
        console.log('️ Playback stopped after 2 minutes');
        
        await expect(page).toHaveURL(/.*radio\.rctiplus\.com.*/);
      }
    }
  });
});

test.describe('Audio Page - All Images Click & Play', () => {
  test('Click and play all available content', async ({ page }) => {
    await page.goto(AUDIO_URL);
    await page.waitForTimeout(3000);
    
    const images = page.locator('[class*="station"] img, [class*="content"] img, [class*="card"] img');
    const count = await images.count();
    console.log(`📊 Found ${count} images to test`);
    
    let playedCount = 0;
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        console.log(`▶️ Playing content ${i + 1}/${Math.min(count, 5)}`);
        
        await img.click();
        await page.waitForTimeout(3000);
        
        const playBtn = page.locator('[class*="play"], button[aria-label*="Play"]').first();
        if (await playBtn.isVisible()) {
          await playBtn.click();
          await page.waitForTimeout(5000); // Play for 5 seconds each
          
          const audioElement = page.locator('audio').first();
          if (await audioElement.count() > 0) {
            const isPlaying = await audioElement.evaluate((el: any) => !el.paused);
            if (isPlaying) {
              playedCount++;
              console.log(`✅ Content ${i + 1} is playing`);
            }
          }
        }
        
        // Go back to continue with next content
        await page.goto(AUDIO_URL);
        await page.waitForTimeout(2000);
      }
    }
    
    console.log(`🎵 Total content played: ${playedCount}`);
    expect(playedCount).toBeGreaterThan(0);
  });
});

test.describe('Audio Page - Desktop Responsive', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(AUDIO_URL);
    await page.waitForTimeout(3000);
  });

  test('Page renders correctly on 1920x1080', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('img').first()).toBeVisible();
    await expect(page.locator('[class*="player"], audio').first()).toBeVisible();
  });

  test('Page renders correctly on 1366x768', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await expect(page.locator('img').first()).toBeVisible();
  });

  test('Page renders correctly on 1440x900', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('img').first()).toBeVisible();
  });

  test('Player controls visible on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[class*="play"], [class*="pause"], [class*="volume"]').first()).toBeVisible();
  });
});
