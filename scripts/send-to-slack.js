const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    process.env[key] = value;
  }
});

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const CHANNEL = process.env.SLACK_CHANNEL || '#reny-report';

if (!WEBHOOK_URL) {
  console.error('❌ SLACK_WEBHOOK_URL not found in .env');
  process.exit(1);
}

const message = process.argv[2] || 'Test message from VS Code';
const status = process.argv[3] || 'info';

const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : status === 'warning' ? '⚠️' : 'ℹ️';
const color = status === 'success' ? '#36a64f' : status === 'error' ? '#e01e5a' : status === 'warning' ? '#ff9800' : '#439FE0';

const payload = {
  channel: CHANNEL,
  username: 'VS Code Bot',
  icon_emoji: ':robot_face:',
  text: `${emoji} ${message}`,
  attachments: [{
    color: color,
    title: 'VS Code Notification',
    fields: [
      { title: 'Status', value: status.toUpperCase(), short: true },
      { title: 'Channel', value: CHANNEL, short: true },
      { title: 'Time', value: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }), short: false },
    ],
  }],
};

const url = new URL(WEBHOOK_URL);
const data = JSON.stringify(payload);

const options = {
  hostname: url.hostname,
  path: url.pathname + url.search,
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
  timeout: 10000
};

const req = https.request(options, (res) => {
  let response = '';
  res.on('data', (chunk) => { response += chunk; });
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`✅ Message sent to ${CHANNEL}`);
    } else {
      console.error(`❌ Slack error: ${res.statusCode}`, response);
    }
  });
});

req.on('error', (e) => console.error('❌ Error:', e.message));
req.on('timeout', () => { req.destroy(); console.error('❌ Timeout'); });
req.write(data);
req.end();
