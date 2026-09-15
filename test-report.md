# Test Report - RCTI+ Login Page Automation

**Project:** WebD Playwright  
**Test File:** `tests/auth/login.specs.ts`  
**Page Object:** `Pages/LoginPage.ts`  
**Target URL:** https://www.rctiplus.com/login  
**Browser:** Chrome (Desktop)  
**Date:** September 14, 2026  
**Credentials:** reny.la28@gmail.com / Rplus123456  

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Tests** | 68 |
| **Passed** | 64 (94.1%) |
| **Failed** | 4 (5.9%) |
| **Execution Time** | ~3.1 minutes |
| **Retries** | 1 per failed test |

---

## Test Results by Suite

### ✅ UI Verification (21 tests) — 20 Passed, 1 Failed

| # | Test Case | Status |
|---|-----------|--------|
| 1 | Login page loads successfully | ✅ |
| 2 | Page has correct title | ✅ |
| 3 | Login card/container is visible | ✅ |
| 4 | Email/phone input and password input are visible | ✅ |
| 5 | Email input has correct placeholder | ✅ |
| 6 | Password input has correct placeholder | ✅ |
| 7 | Password field type is password (masked) | ✅ |
| 8 | Email/Phone label is visible | ✅ |
| 9 | Password label is visible | ✅ |
| 10 | Login button is visible but disabled when fields are empty | ✅ |
| 11 | Login button has correct text | ✅ |
| 12 | Google sign-in button is visible | ✅ |
| 13 | Google sign-in button has correct text | ✅ |
| 14 | Forgot password link is visible | ✅ |
| 15 | Register link is visible | ✅ |
| 16 | Terms & Conditions link is visible | ✅ |
| 17 | Privacy Policy link is visible | ✅ |
| 18 | No error message shown on initial page load | ✅ |
| 19 | Login Account heading is visible | ✅ |
| 20 | **Country selector is visible** | ❌ |
| 21 | Social media icons are visible | ✅ |

**Failure Detail:** Strict mode violation — locator `#drop-country, .option-country` matched 2 elements. Fix: use `.first()` or more specific selector.

---

### ✅ Positive Flow (2 tests) — 2 Passed

| # | Test Case | Status |
|---|-----------|--------|
| 1 | User can login with valid credentials | ✅ |
| 2 | User is redirected to homepage after successful login | ✅ |

---

### ✅ Negative Flow (9 tests) — 9 Passed

| # | Test Case | Status |
|---|-----------|--------|
| 1 | Login fails with invalid email and password | ✅ |
| 2 | Login fails with wrong password shows error message | ✅ |
| 3 | Login fails with non-existent email | ✅ |
| 4 | Login button becomes enabled after filling email and password | ✅ |
| 5 | Login button remains disabled when only password is filled | ✅ |
| 6 | Login button remains disabled when only email is filled | ✅ |
| 7 | Login button remains disabled with password less than 8 characters | ✅ |
| 8 | Login button enabled with password exactly 8 characters | ✅ |
| 9 | Login button enabled with password more than 8 characters | ✅ |

---

### ✅ Input Validation (10 tests) — 10 Passed

| # | Test Case | Status |
|---|-----------|--------|
| 1 | Email input accepts valid email format | ✅ |
| 2 | Email input accepts phone number format | ✅ |
| 3 | Password input masks characters | ✅ |
| 4 | Input fields can be cleared and refilled | ✅ |
| 5 | Special characters accepted in password field | ✅ |
| 6 | Email input accepts email with plus sign | ✅ |
| 7 | Email input accepts email with dots | ✅ |
| 8 | Password field accepts spaces | ✅ |
| 9 | Input fields handle very long text | ✅ |
| 10 | Password field handles unicode characters | ✅ |

---

### ⚠️ Keyboard Navigation (3 tests) — 2 Passed, 1 Failed

| # | Test Case | Status |
|---|-----------|--------|
| 1 | Tab key moves focus from email to password field | ✅ |
| 2 | **Tab key moves focus from password to login button** | ❌ |
| 3 | Enter key submits form when password field is focused | ✅ |

**Failure Detail:** The login button (`#btnLogin-ahref`) is an `<a>` tag without `tabindex`, so it's not in the natural tab order. This is an accessibility issue on the website itself.

---

### ✅ Navigation (7 tests) — 7 Passed

| # | Test Case | Status |
|---|-----------|--------|
| 1 | Forgot password link navigates to correct page | ✅ |
| 2 | Register link navigates to correct page | ✅ |
| 3 | Terms & Conditions link navigates to correct page | ✅ |
| 4 | Privacy Policy link navigates to correct page | ✅ |
| 5 | Google login button navigates to Google auth | ✅ |
| 6 | Forgot password link opens in same tab | ✅ |
| 7 | Register link opens in same tab | ✅ |

---

### ✅ Error Handling (5 tests) — 5 Passed

| # | Test Case | Status |
|---|-----------|--------|
| 1 | Error message appears after failed login attempt | ✅ |
| 2 | Error message contains relevant text | ✅ |
| 3 | Error message is displayed in a visible alert box | ✅ |
| 4 | Error message has red/pink background color | ✅ |
| 5 | Form fields are cleared after failed login | ✅ |

---

### ✅ Security (5 tests) — 5 Passed

| # | Test Case | Status |
|---|-----------|--------|
| 1 | Password is not visible in URL after login attempt | ✅ |
| 2 | Form uses POST method for submission | ✅ |
| 3 | CSRF token is present in form | ✅ |
| 4 | Password field has autocomplete off or appropriate setting | ✅ |
| 5 | Form action points to login endpoint | ✅ |

---

### ⚠️ Responsive Design (3 tests) — 2 Passed, 1 Failed

| # | Test Case | Status |
|---|-----------|--------|
| 1 | **Login page renders correctly on mobile viewport (375x667)** | ❌ |
| 2 | Login page renders correctly on tablet viewport (768x1024) | ✅ |
| 3 | Login page renders correctly on desktop viewport (1920x1080) | ✅ |

**Failure Detail:** On mobile viewport (375x667), the login form input `input[name="username"]` is not found. The page may redirect to a mobile-specific layout or the form may be hidden behind a mobile menu.

---

### ⚠️ Accessibility (3 tests) — 2 Passed, 1 Failed

| # | Test Case | Status |
|---|-----------|--------|
| 1 | **Email input has associated label** | ❌ |
| 2 | Password input has associated label | ✅ |
| 3 | Login button is clickable | ✅ |

**Failure Detail:** The label `for` attribute is `"email"` but the input `id` is `"username"`. This is a mismatch in the website's HTML — an accessibility bug on rctiplus.com.

---

## Failed Tests Summary & Recommendations

| # | Test | Root Cause | Recommendation |
|---|------|------------|----------------|
| 1 | Country selector is visible | Locator matches 2 elements | Use `.first()` or more specific selector like `#drop-country` |
| 2 | Tab focus to login button | `<a>` tag without `tabindex` not in tab order | Website accessibility issue — add `tabindex="0"` to button |
| 3 | Mobile viewport rendering | Form not visible at 375px width | Investigate mobile layout — may need different locator or wait condition |
| 4 | Email label association | Label `for="email"` but input `id="username"` | Website HTML bug — fix label `for` attribute to match input `id` |

---

## Key Findings

### ✅ What Works Well
- Login functionality works correctly with valid credentials
- Form validation enforces minimum 8-character password
- CSRF protection is properly implemented
- Error messages display correctly with appropriate styling
- All navigation links work as expected
- Password is properly masked and not exposed in URL
- Form uses POST method securely

### ⚠️ Issues Found on Website
1. **Accessibility:** Email label `for` attribute mismatch (`for="email"` vs `id="username"`)
2. **Accessibility:** Login button not keyboard-focusable (missing `tabindex`)
3. **Responsive:** Mobile viewport (375px) may have layout issues
4. **UI:** Country selector has duplicate elements causing selector ambiguity

---

## Test Coverage

| Category | Tests | Coverage |
|----------|-------|----------|
| UI Elements | 21 | 95% |
| Positive Flow | 2 | 100% |
| Negative Flow | 9 | 100% |
| Input Validation | 10 | 100% |
| Keyboard Navigation | 3 | 67% |
| Navigation Links | 7 | 100% |
| Error Handling | 5 | 100% |
| Security | 5 | 100% |
| Responsive Design | 3 | 67% |
| Accessibility | 3 | 67% |
| **Total** | **68** | **94%** |

---

## Environment

- **Playwright Version:** 1.59.1
- **Node.js:** Installed via npm
- **Browser:** Chromium (Chrome)
- **OS:** macOS (darwin)
- **Headless:** Yes (for test runs)
- **Base URL:** https://www.rctiplus.com
- **Timeout:** 60s per test, 10s for expect, 15s for actions
- **Retries:** 1
- **Screenshot:** On failure
- **Video:** Retained on failure
- **Trace:** Retained on failure
