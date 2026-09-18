# VS Code + Slack Integration Guide

##  Overview

Integrasi VS Code dengan Slack channel `#reny-report` untuk mengirim notifikasi dan report otomatis.

---

##  Konfigurasi

### 1. Environment Variables (`.env`)

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_CHANNEL="#reny-report"
```

### 2. Files

- `scripts/send-to-slack.js` - Script untuk kirim pesan ke Slack
- `send-html-report.js` - Script untuk kirim HTML report dengan public URL
- `package.json` - NPM scripts untuk kemudahan

---

##  Cara Pakai dari VS Code Terminal

###  Test Koneksi Slack

```bash
npm run slack:test
```

###  Kirim Notifikasi Success

```bash
npm run slack:success
```

###  Kirim Notifikasi Error

```bash
npm run slack:error
```

###  Kirim Report dengan Public URL

```bash
npm run slack:report
```

---

##  NPM Scripts Available

| Command | Description |
|---------|-------------|
| `npm run slack:test` | Test koneksi Slack |
| `npm run slack:success` | Kirim notifikasi success |
| `npm run slack:error` | Kirim notifikasi error |
| `npm run slack:report` | Kirim HTML report dengan public URL |
| `npm run test:login` | Run login tests |
| `npm run test:homepage` | Run homepage tests |
| `npm run test:audio` | Run audio tests |
| `npm run test:slack` | Run tests + send report to Slack |
| `npm run report` | Open HTML report in browser |

---

##  VS Code Tasks Configuration

Tambahkan di `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Slack: Test Connection",
      "type": "shell",
      "command": "npm run slack:test"
    },
    {
      "label": "Slack: Send Success",
      "type": "shell",
      "command": "npm run slack:success"
    },
    {
      "label": "Slack: Send Error",
      "type": "shell",
      "command": "npm run slack:error"
    },
    {
      "label": "Slack: Send Report",
      "type": "shell",
      "command": "npm run slack:report"
    },
    {
      "label": "Test: Login Page",
      "type": "shell",
      "command": "npm run test:login"
    },
    {
      "label": "Test: Homepage",
      "type": "shell",
      "command": "npm run test:homepage"
    },
    {
      "label": "Test: Audio Page",
      "type": "shell",
      "command": "npm run test:audio"
    },
    {
      "label": "Test: All + Send Report",
      "type": "shell",
      "command": "npm run test:slack"
    }
  ]
}
```

---

##  VS Code Keyboard Shortcuts

Tambahkan di `.vscode/keybindings.json`:

```json
[
  {
    "key": "ctrl+alt+s",
    "command": "workbench.action.tasks.runTask",
    "args": "Slack: Test Connection"
  },
  {
    "key": "ctrl+alt+r",
    "command": "workbench.action.tasks.runTask",
    "args": "Slack: Send Report"
  }
]
```

---

##  Custom Messages

```bash
# Kirim pesan custom
node scripts/send-to-slack.js "Your custom message" info

# Dengan status
node scripts/send-to-slack.js "Deployment completed" success
node scripts/send-to-slack.js "Build failed" error
node scripts/send-to-slack.js "Low disk space" warning
```

---

##  Output di Slack

###  Test Message
```
ℹ️ Test message from VS Code

VS Code Notification
━━━━━━━━━━━━━━━━━━━━
Status: INFO
Channel: #reny-report
Time: 15/9/2026, 17.50.30
```

###  Success Message
```
✅ Test completed successfully

VS Code Notification
━━━━━━━━━━━━━━━━━━━━
Status: SUCCESS
Channel: #reny-report
Time: 15/9/2026, 17.50.30
```

###  Report Message
```
📊 Playwright HTML Report - Login Page (Desktop)

Report Type: HTML (Interactive)
Browser: Desktop (Chrome/Firefox/Safari)
URL: www.rctiplus.com

Click the link above to view the interactive HTML report.

URL: https://abc-123.serveo.net
Expires: When tunnel is closed
```

---

##  Troubleshooting

###  Error: SLACK_WEBHOOK_URL not found

**Solution:** Pastikan `.env` file ada dan berisi:
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

###  Error: Tunnel timeout

**Solution:** Serveo.net mungkin down. Alternatif:
```bash
# Gunakan localtunnel
npx lt --port 9323

# Atau ngrok
npx ngrok http 9323
```

###  Error: Channel not found

**Solution:** Pastikan bot sudah di-invite ke channel:
```
/invite @VS Code Bot
```

---

##  Setup Slack Webhook

1. Buka https://api.slack.com/apps
2. Create New App → From scratch
3. Features → Incoming Webhooks → Activate
4. Add New Webhook to Workspace → Pilih channel `#reny-report`
5. Copy Webhook URL ke `.env`

---

##  Support

Untuk pertanyaan atau issue, hubungi tim QA Automation.
