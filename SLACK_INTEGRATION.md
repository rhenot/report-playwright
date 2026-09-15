# Slack Integration Guide - Playwright Test Reports

## Overview

Integrasi ini mengirimkan hasil test Playwright otomatis ke Slack channel setelah test selesai dijalankan.

---

## Setup Slack Webhook

### 1. Buat Slack App

1. Buka https://api.slack.com/apps
2. Klik **Create New App**
3. Pilih **From scratch**
4. Masukkan:
   - **App Name:** `Playwright Test Reporter` (atau nama bebas)
   - **Workspace:** Pilih workspace kamu
5. Klik **Create App**

### 2. Aktifkan Incoming Webhooks

1. Di sidebar kiri, klik **Features → Incoming Webhooks**
2. Toggle switch ke **On**
3. Klik **Add New Webhook to Workspace**
4. Pilih channel tujuan (misal: `#test-reports` atau `#qa-automation`)
5. Klik **Allow**
6. **Copy Webhook URL** (format: `https://hooks.slack.com/services/T.../B.../xxx`)

### 3. Konfigurasi Environment

Buka file `.env` dan update:

```env
# Ganti dengan webhook URL dari Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
SLACK_CHANNEL=#test-reports
```

---

## Cara Penggunaan

### Install Dependencies

```bash
npm install
```

### Jalankan Test + Kirim ke Slack

```bash
# Cara 1: Via npm script
npm run test:slack

# Cara 2: Manual
npx ts-node run-tests-with-slack.ts
```

### Jalankan Test Saja (Tanpa Slack)

```bash
# Headless
npm run test:login

# Dengan browser terbuka
npm run test:login:headed
```

### Lihat Report HTML

```bash
npm run report
```

---

## Contoh Output di Slack

```
✅ RCTI+ Login Page - Test Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Tests:  68
Passed:       64
Failed:       4
Pass Rate:    94.1%
Duration:     3.1 min
Date:         14/09/2026, 10.30.45

❌ Failed Tests
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. UI Verification → Country selector is visible
2. Keyboard Navigation → Tab key moves focus from password to login button
3. Responsive Design → Login page renders correctly on mobile viewport
4. Accessibility → Email input has associated label
```

---

## Customization

### Ubah Format Pesan

Edit file `utils/slack-reporter.ts` untuk mengubah:
- Warna attachment (`color`)
- Emoji status
- Format field
- Tambah/remove informasi

### Kirim ke Multiple Channels

Tambahkan webhook URL di `.env`:

```env
SLACK_WEBHOOK_URL_1=https://hooks.slack.com/services/...
SLACK_WEBHOOK_URL_2=https://hooks.slack.com/services/...
SLACK_CHANNEL_1=#test-reports
SLACK_CHANNEL_2=#qa-team
```

Lalu update `SlackReporter` class untuk loop melalui multiple webhooks.

### Tambah Mention User/Channel

Edit payload di `slack-reporter.ts`:

```typescript
const payload = {
  channel: this.channel,
  text: report.failed > 0 ? '<@USER_ID> Tests failed!' : 'All tests passed!',
  // ... rest of payload
};
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run tests and send Slack report
        run: npm run test:slack
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_CHANNEL: '#test-reports'
```

### GitLab CI

```yaml
test:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-jammy
  script:
    - npm ci
    - npm run test:slack
  variables:
    SLACK_WEBHOOK_URL: $SLACK_WEBHOOK_URL
    SLACK_CHANNEL: "#test-reports"
```

---

## Troubleshooting

### Error: "Slack webhook URL not configured"

**Penyebab:** `SLACK_WEBHOOK_URL` belum di-set di `.env`

**Solusi:** 
1. Buka `.env`
2. Tambahkan webhook URL yang valid
3. Restart test

### Error: "Failed to send report to Slack"

**Penyebab:** Webhook URL invalid atau expired

**Solusi:**
1. Cek webhook URL di Slack App settings
2. Regenerate webhook jika perlu
3. Update `.env` dengan URL baru

### Error: "Channel not found"

**Penyebab:** Channel name salah atau bot tidak di-invite ke channel

**Solusi:**
1. Pastikan channel name benar (dengan `#`)
2. Invite bot ke channel: `/invite @Playwright Test Reporter`

---

## File Structure

```
project/
├── .env                          # Environment variables (termasuk Slack webhook)
├── utils/
│   ── slack-reporter.ts         # Slack reporter utility
├── run-tests-with-slack.ts       # Main script untuk run test + kirim Slack
├── package.json                  # NPM scripts
└── SLACK_INTEGRATION.md          # Dokumentasi ini
```

---

## Security Notes

⚠️ **Penting:**
- Jangan commit `.env` ke repository (sudah ada di `.gitignore`)
- Untuk CI/CD, gunakan **Secrets/Environment Variables** di platform CI
- Webhook URL bersifat sensitif - jangan share secara publik
- Rotate webhook URL secara berkala untuk security

---

## Support

Untuk pertanyaan atau issue, hubungi tim QA Automation.
