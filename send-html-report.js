const { execSync, exec } = require('child_process');

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
const CHANNEL = process.env.SLACK_CHANNEL || '#reny-report';

async function main() {
  console.log('🚀 Starting Playwright HTML report server...\n');

  // Start Playwright report server in background
  const reportServer = exec('npx playwright show-report --port=9323');
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('📡 Creating public tunnel via serveo.net...\n');

  try {
    // Create SSH tunnel via serveo.net
    const tunnelProcess = exec('ssh -o StrictHostKeyChecking=no -R 80:localhost:9323 serveo.net');
    
    // Wait for tunnel URL
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get the public URL from serveo
    const tunnelUrl = await new Promise((resolve, reject) => {
      let output = '';
      tunnelProcess.stdout.on('data', (data) => {
        output += data.toString();
        const match = output.match(/https:\/\/[a-z0-9-]+\.serveo\.net/);
        if (match) {
          resolve(match[0]);
        }
      });
      
      setTimeout(() => reject(new Error('Tunnel timeout')), 15000);
    });

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
      attachments: [
        {
          color: '#439FE0',
          title: '📊 Playwright HTML Report - Login Page (Desktop)',
          title_link: tunnelUrl,
          text: `Click the link above to view the interactive HTML report.\n\n*URL:* ${tunnelUrl}\n*Expires:* When tunnel is closed`,
          fields: [
            { title: 'Report Type', value: 'HTML (Interactive)', short: true },
            { title: 'Browser', value: 'Desktop (Chrome/Firefox/Safari)', short: true },
            { title: 'URL', value: 'www.rctiplus.com', short: true },
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
      console.log(`\n🔗 Public URL: ${tunnelUrl}`);
      console.log('️  Keep this terminal open to maintain the tunnel.');
      console.log('   Press Ctrl+C to close the tunnel when done.\n');
    } else {
      console.error('❌ Failed to send to Slack:', response.status, response.statusText);
    }

    // Keep the tunnel open
    console.log('\n📡 Tunnel is active. Press Ctrl+C to close.\n');
    
    // Keep process alive
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n Alternative: Run this command manually in a new terminal:');
    console.log('   ssh -R 80:localhost:9323 serveo.net\n');
    reportServer.kill();
    process.exit(1);
  }
}

main().catch(console.error);
