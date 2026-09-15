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

  console.log(' Creating public URL via localtunnel...\n');

  try {
    // Use localtunnel to create public URL
    const lt = require('localtunnel');
    
    const tunnel = await lt({ port: 9323 });
    const tunnelUrl = tunnel.url;
    
    console.log(`✅ Public URL: ${tunnelUrl}\n`);

    // Send to Slack
    if (!WEBHOOK_URL || WEBHOOK_URL.includes('YOUR/WEBHOOK/URL')) {
      console.log('⚠️  Slack webhook URL not configured.');
      console.log(`\n📋 Report URL: ${tunnelUrl}`);
      return;
    }

    const payload = {
      channel: CHANNEL,
      username: 'Playwright Test Bot',
      icon_emoji: ':robot_face:',
      text: ' *Playwright HTML Report - Login Page (Desktop)*',
      attachments: [
        {
          color: '#439FE0',
          title: '🔗 Click to view interactive HTML report',
          title_link: tunnelUrl,
          text: `*Public URL:* ${tunnelUrl}\n\n_⚠️ Tunnel expires when this script is stopped_`,
          fields: [
            { title: 'Report Type', value: 'HTML (Interactive)', short: true },
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
      console.log('✅ Report link sent to Slack successfully!');
      console.log(`\n Public URL: ${tunnelUrl}`);
      console.log('⚠️  Keep this terminal open to maintain the tunnel.');
      console.log('   Press Ctrl+C to close the tunnel when done.\n');
    } else {
      console.error('❌ Failed to send to Slack:', response.status, response.statusText);
    }

    // Keep the tunnel open
    console.log('📡 Tunnel is active. Press Ctrl+C to close.\n');
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    reportServer.kill();
    process.exit(1);
  }
}

main().catch(console.error);
