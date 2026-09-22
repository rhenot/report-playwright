# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth/loginwd.specs.ts >> Login Page - UI Verification >> Login page loads successfully
- Location: tests/auth/loginwd.specs.ts:17:7

# Error details

```
Test timeout of 60000ms exceeded while running "beforeEach" hook.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2] [cursor=pointer]
  - generic [ref=e7]:
    - generic [ref=e8]:
      - heading "Login Account" [level=4] [ref=e9]
      - text:   
      - generic [ref=e10]:
        - tabpanel [ref=e11]:
          - generic [ref=e13]:
            - generic [ref=e14]: Email or Phone Number
            - generic [ref=e15]:
              - textbox "Insert email or phone number" [ref=e16]
              - text: 
        - generic [ref=e17]:
          - generic [ref=e18]: Password
          - textbox "Password" [ref=e19]:
            - /placeholder: Insert password
          - generic [ref=e20]: 
          - generic [ref=e21]:
            - text: Forgot Password ?
            - link "Click here" [ref=e22] [cursor=pointer]:
              - /url: https://www.rctiplus.com/forgot-password
          - generic: Login
          - generic [ref=e23]:
            - text: Don’t have an account?
            - link "Register here." [ref=e24] [cursor=pointer]:
              - /url: https://www.rctiplus.com/register
          - separator [ref=e25]
          - link "Sign in with Google" [ref=e27] [cursor=pointer]:
            - /url: /login/google
          - generic [ref=e29]:
            - text: By clicking the Log In button, you agree to our
            - link "Terms & Conditions" [ref=e30] [cursor=pointer]:
              - /url: https://www.rctiplus.com/terms-&-conditions
            - text: and
            - link "Privacy Policy" [ref=e31] [cursor=pointer]:
              - /url: /privacy
            - text: .
    - generic [ref=e35]:
      - link [ref=e36] [cursor=pointer]:
        - /url: https://twitter.com/rctiplus
        - img "Twitter" [ref=e37]
      - link [ref=e38] [cursor=pointer]:
        - /url: https://www.facebook.com/RCTIPlusOfficial/
        - img "Facebook" [ref=e39]
      - link [ref=e40] [cursor=pointer]:
        - /url: https://www.instagram.com/rctiplusofficial/?hl=id
        - img "Instagram" [ref=e41]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { LoginPage } from '../../Pages/LoginPage';
  3   | 
  4   | const VALID_EMAIL = 'reny.la28@gmail.com';
  5   | const VALID_PASSWORD = 'Rplus123456';
  6   | const DESKTOP_PROJECTS = ['chrome', 'firefox', 'safari'];
  7   | const isNonDesktop = () => !DESKTOP_PROJECTS.includes(test.info().project.name);
  8   | 
  9   | test.describe('Login Page - UI Verification', () => {
  10  |   test.skip(isNonDesktop, 'Desktop only test');
  11  | 
> 12  |   test.beforeEach(async ({ page }) => {
      |        ^ Test timeout of 60000ms exceeded while running "beforeEach" hook.
  13  |     const loginPage = new LoginPage(page);
  14  |     await loginPage.goto();
  15  |   });
  16  | 
  17  |   test('Login page loads successfully', async ({ page }) => {
  18  |     await expect(page).toHaveURL(/.*login.*/);
  19  |   });
  20  | 
  21  |   test('Email/phone input and password input are visible', async ({ page }) => {
  22  |     const loginPage = new LoginPage(page);
  23  |     await loginPage.verifyLoginPageVisible();
  24  |   });
  25  | 
  26  |   test('Email input has correct placeholder', async ({ page }) => {
  27  |     await expect(page.locator('input[name="username"]')).toHaveAttribute('placeholder', 'Insert email or phone number');
  28  |   });
  29  | 
  30  |   test('Email/Phone label is visible', async ({ page }) => {
  31  |     const loginPage = new LoginPage(page);
  32  |     await loginPage.verifyEmailInputLabel();
  33  |   });
  34  | 
  35  |   test('Password label is visible', async ({ page }) => {
  36  |     const loginPage = new LoginPage(page);
  37  |     await loginPage.verifyPasswordInputLabel();
  38  |   });
  39  | 
  40  |   test('Login button is visible but disabled when fields are empty', async ({ page }) => {
  41  |     const loginPage = new LoginPage(page);
  42  |     await loginPage.verifyLoginButtonVisible();
  43  |     await loginPage.verifyLoginButtonDisabled();
  44  |   });
  45  | 
  46  |   test('Login button has correct text', async ({ page }) => {
  47  |     const loginPage = new LoginPage(page);
  48  |     await loginPage.verifyLoginButtonHasText('Login');
  49  |   });
  50  | 
  51  |   test('Google sign-in button is visible', async ({ page }) => {
  52  |     const loginPage = new LoginPage(page);
  53  |     await loginPage.verifyGoogleLoginVisible();
  54  |   });
  55  | 
  56  |   test('Google sign-in button has correct text', async ({ page }) => {
  57  |     await expect(page.locator('#btn-google')).toHaveText(/Sign in with Google/);
  58  |   });
  59  | 
  60  |   test('Forgot password link is visible', async ({ page }) => {
  61  |     const loginPage = new LoginPage(page);
  62  |     await loginPage.verifyForgotPasswordLinkVisible();
  63  |   });
  64  | 
  65  |   test('Register link is visible', async ({ page }) => {
  66  |     const loginPage = new LoginPage(page);
  67  |     await loginPage.verifyRegisterLinkVisible();
  68  |   });
  69  | 
  70  |   test('Terms & Conditions link is visible', async ({ page }) => {
  71  |     const loginPage = new LoginPage(page);
  72  |     await loginPage.verifyTermsLinkVisible();
  73  |   });
  74  | 
  75  |   test('Privacy Policy link is visible', async ({ page }) => {
  76  |     const loginPage = new LoginPage(page);
  77  |     await loginPage.verifyPrivacyLinkVisible();
  78  |   });
  79  | 
  80  |   test('No error message shown on initial page load', async ({ page }) => {
  81  |     await expect(page.locator('#message_client')).not.toBeVisible();
  82  |   });
  83  | 
  84  |   test('Login Account heading is visible', async ({ page }) => {
  85  |     await expect(page.locator('h4:has-text("Login Account")')).toBeVisible();
  86  |   });
  87  | 
  88  |   test('Social media icons are visible', async ({ page }) => {
  89  |     await expect(page.locator('.social-media a, [class*="social"] a').first()).toBeVisible();
  90  |   });
  91  | });
  92  | 
  93  | test.describe('Login Page - Positive Flow', () => {
  94  |   test.skip(isNonDesktop, 'Desktop only test');
  95  | 
  96  |   test('User can login with valid credentials', async ({ page }) => {
  97  |     const loginPage = new LoginPage(page);
  98  |     await loginPage.goto();
  99  |     await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
  100 |     await loginPage.verifyLoginSuccess();
  101 |   });
  102 | 
  103 |   test('User is redirected to homepage after successful login', async ({ page }) => {
  104 |     const loginPage = new LoginPage(page);
  105 |     await loginPage.goto();
  106 |     await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
  107 |     await expect(page).toHaveURL(/rctiplus\.com\/?$/);
  108 |   });
  109 | });
  110 | 
  111 | test.describe('Login Page - Negative Flow', () => {
  112 |   test.skip(isNonDesktop, 'Desktop only test');
```