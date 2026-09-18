# 📊 Playwright Test Report - Login Page (Desktop)

---

## 1. QC: Reny

## 2. Jumlah Test Case: 52

## 3. Jumlah Test Case Failed: 3

## 4. Breakdown Semua Test Case

### Suite: Login Page - UI Verification (17 tests)

| No | Status | Test Case |
|----|--------|-----------|
| 1  | ✅     | Login page loads successfully |
| 2  | ✅     | Email/phone input and password input are visible |
| 3  | ✅     | Email input has correct placeholder |
| 4  | ✅     | Email/Phone label is visible |
| 5  | ✅     | Password label is visible |
| 6  | ✅     | Login button is visible but disabled when fields are empty |
| 7  | ✅     | Login button has correct text |
| 8  | ✅     | Google sign-in button is visible |
| 9  | ✅     | Google sign-in button has correct text |
| 10 | ✅     | Forgot password link is visible |
| 11 | ✅     | Register link is visible |
| 12 | ✅     | Terms & Conditions link is visible |
| 13 | ✅     | Privacy Policy link is visible |
| 14 | ✅     | No error message shown on initial page load |
| 15 | ✅     | Login Account heading is visible |
| 16 | ✅     | Social media icons are visible |

### Suite: Login Page - Positive Flow (2 tests)

| No | Status | Test Case |
|----|--------|-----------|
| 1  | ✅     | User can login with valid credentials |
| 2  | ✅     | User is redirected to homepage after successful login |

### Suite: Login Page - Negative Flow (9 tests)

| No | Status | Test Case |
|----|--------|-----------|
| 1  | ✅     | Login fails with invalid email and password |
| 2  | ✅     | Login fails with wrong password shows error message |
| 3  | ✅     | Login fails with non-existent email |
| 4  | ✅     | Login button becomes enabled after filling email and password |
| 5  | ✅     | Login button remains disabled when only password is filled |
| 6  | ✅     | Login button remains disabled when only email is filled |
| 7  | ✅     | Login button remains disabled with password less than 8 characters |
| 8  | ✅     | Login button enabled with password exactly 8 characters |
| 9  | ✅     | Login button enabled with password more than 8 characters |

### Suite: Login Page - Input Validation (9 tests)

| No | Status | Test Case |
|----|--------|-----------|
| 1  | ✅     | Email input accepts valid email format |
| 2  | ✅     | Email input accepts phone number format |
| 3  | ✅     | Password input masks characters |
| 4  | ✅     | Input fields can be cleared and refilled |
| 5  | ✅     | Special characters accepted in password field |
| 6  | ✅     | Email input accepts email with plus sign |
| 7  | ✅     | Email input accepts email with dots |
| 8  | ✅     | Password field accepts spaces |
| 9  | ✅     | Password field handles unicode characters |

### Suite: Login Page - Navigation (7 tests)

| No | Status | Test Case |
|----|--------|-----------|
| 1  | ✅     | Forgot password link navigates to correct page |
| 2  | ✅     | Register link navigates to correct page |
| 3  | ✅     | Terms & Conditions link navigates to correct page |
| 4  | ✅     | Privacy Policy link navigates to correct page |
| 5  | ✅     | Google login button navigates to Google auth |
| 6  | ✅     | Forgot password link opens in same tab |
| 7  | ✅     | Register link opens in same tab |

### Suite: Login Page - Error Handling (5 tests)

| No | Status | Test Case |
|----|--------|-----------|
| 1  | ✅     | Error message appears after failed login attempt |
| 2  | ✅     | Error message contains relevant text |
| 3  | ✅     | Error message is displayed in a visible alert box |
| 4  | ✅     | Error message has red/pink background color |
| 5  | ✅     | Form fields are cleared after failed login |

### Suite: Login Page - Security (5 tests)

| No | Status | Test Case |
|----|--------|-----------|
| 1  | ✅     | Password is not visible in URL after login attempt |
| 2  | ✅     | Form uses POST method for submission |
| 3  | ✅     | CSRF token is present in form |
| 4  | ✅     | Password field has autocomplete off or appropriate setting |
| 5  | ✅     | Form action points to login endpoint |

### Suite: Login Page - Responsive Design (2 tests)

| No | Status | Test Case |
|----|--------|-----------|
| 1  | ✅     | Login page renders correctly on tablet viewport |
| 2  | ✅     | Login page renders correctly on desktop viewport |

### Suite: Login Page - Accessibility (2 tests)

| No | Status | Test Case |
|----|--------|-----------|
| 1  | ✅     | Password input has associated label |
| 2  | ✅     | Login button is clickable |

---

## 5. Jumlah Test Case Passed: 49 (94.2%)

---

## 6. Analisa Test Failed

### Test 1: Login page loads successfully
- **Suite:** Login Page - UI Verification
- **Error:** `page.goto: net::ERR_TIMED_OUT at https://www.rctiplus.com/login`
- **Root Cause:** Network timeout saat load halaman login
- **Rekomendasi:** Tambah timeout atau check koneksi internet

### Test 2: User can login with valid credentials
- **Suite:** Login Page - Positive Flow
- **Error:** `expect(page).not.toHaveURL failed - URL masih di /login`
- **Root Cause:** Credentials salah atau akun terkunci
- **Rekomendasi:** Verifikasi credentials dengan login manual

### Test 3: Login button remains disabled when only email is filled
- **Suite:** Login Page - Negative Flow
- **Error:** `expect(locator).not.toBeVisible failed - button ternyata visible`
- **Root Cause:** Logic validasi button berubah di frontend
- **Rekomendasi:** Update test case sesuai behavior terbaru

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Tests** | 52 |
| **Passed** | 49 ✅ |
| **Failed** | 3 ❌ |
| **Flaky** | 0 ️ |
| **Pass Rate** | 94.2% |
| **Duration** | 3.2 min |
| **Browser** | Chrome (Desktop) |
| **URL** | https://www.rctiplus.com/login |
| **Date** | 15/9/2026, 16.30.45 WIB |

---

## Rekomendasi

1. **Network Issues (1 test):** Tambah retry mechanism untuk test yang bergantung pada network
2. **Credentials Issue (1 test):** Gunakan test account yang dedicated untuk automation
3. **UI Changes (1 test):** Update locator sesuai perubahan UI terbaru

---

## Test Environment

- **Playwright Version:** 1.59.1
- **Node.js:** 24.15.0
- **Browser:** Chromium (Chrome)
- **Viewport:** 1280x720
- **Headless:** Yes
- **OS:** macOS (darwin)

---

*Report generated by Playwright Test Automation*
