import { test, expect } from '@playwright/test';

test.describe('Video Playback', () => {

  test('Video player can play content', async ({ page }) => {

    await page.goto('/tv/rcti');

    const video = page.locator('video');

    await expect(video).toBeVisible();

    await page.waitForTimeout(5000);

    const isPaused = await video.evaluate(
      (video: HTMLVideoElement) => video.paused
    );

    expect(isPaused).toBeFalsy();
  });

});