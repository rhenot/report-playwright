const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load .env manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
});

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
const CHANNEL = process.env.SLACK_CHANNEL || '#report-automate';

async function main() {
  console.log('🚀 Starting Playwright HTML report server...\n');

  // Start Playwright report server
  const reportServer = exec('npx playwright show-report --port=9323');
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('📸 Taking screenshot of report...\n');

  try {
    // Use Playwright to take screenshot
    const { chromium } = require('playwright');
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    
    await page.goto('http://localhost:9323', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Take screenshot
    const screenshotPath = path.join(__dirname, 'report-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    await browser.close();
    
    console.log(`✅ Screenshot saved: ${screenshotPath}\n`);

    // Read image buffer
    const imageBuffer = fs.readFileSync(screenshotPath);

    // Send to Slack with image URL
    if (!WEBHOOK_URL || WEBHOOK_URL.includes('YOUR/WEBHOOK/URL')) {
      console.log('⚠️  Slack webhook URL not configured.');
      return;
    }

    // Upload image to 0x0.st (free image hosting)
    console.log(' Uploading screenshot to image hosting...\n');
    
    let imageUrl = '';
    try {
      const uploadResponse = await fetch('https://0x0.st', {
        method: 'POST',
        body: (() => {
          const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
          const body = new Uint8Array([
            ...Buffer.from(`--${boundary}\r\n`),
            ...Buffer.from(`Content-Disposition: form-data; name="file"; filename="report.png"\r\n`),
            ...Buffer.from(`Content-Type: image/png\r\n\r\n`),
            ...imageBuffer,
            ...Buffer.from(`\r\n--${boundary}--\r\n`),
          ]);
          return body;
        })(),
        headers: {
          'Content-Type': `multipart/form-data; boundary=----FormBoundary${Math.random().toString(36).substring(2)}`,
        },
      });
      
      if (uploadResponse.ok) {
        imageUrl = await uploadResponse.text();
        console.log(`✅ Image uploaded: ${imageUrl}\n`);
      } else {
        console.log('️  Image upload failed, sending without image\n');
      }
    } catch (error) {
      console.log('⚠️  Image upload error:', error.message);
    }

    const payload = {
      channel: CHANNEL,
      username: 'Playwright Test Bot',
      icon_emoji: ':robot_face:',
      text: '📊 *Playwright HTML Report - Login Page (Desktop)*',
      attachments: [
        {
          color: '#439FE0',
          title: 'Test Report Screenshot',
          ...(imageUrl && { image_url: imageUrl }),
          fields: [
            { title: 'Report Type', value: 'HTML Report', short: true },
            { title: 'Browser', value: 'Desktop (Chrome/Firefox/Safari)', short: true },
            { title: 'URL', value: 'www.rctiplus.com', short: true },
            { title: 'Date', value: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }), short: true },
          ],
        },
      ],
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('✅ Report summary sent to Slack successfully!');
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
    } else {
      console.error('❌ Failed to send to Slack:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response:', text);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    reportServer.kill();
  }
}

main().catch(console.error);
