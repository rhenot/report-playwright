import { test, expect } from '@playwright/test';
import { LoginPage } from '../../Pages/LoginPage';

const VALID_EMAIL = 'reny.la28@gmail.com';
const VALID_PASSWORD = 'Rplus123456';

test.describe('Login Page - UI Verification', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop only test');

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('Login page loads successfully', async ({ page }) => {
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('Email/phone input and password input are visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.verifyLoginPageVisible();
  });

  test('Email input has correct placeholder', async ({ page }) => {
    await expect(page.locator('input[name="username"]')).toHaveAttribute('placeholder', 'Insert email or phone number');
  });

  test('Email/Phone label is visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.verifyEmailInputLabel();
  });

  test('Password label is visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.verifyPasswordInputLabel();
  });

  test('Login button is visible but disabled when fields are empty', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.verifyLoginButtonVisible();
    await loginPage.verifyLoginButtonDisabled();
  });

  test('Login button has correct text', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.verifyLoginButtonHasText('Login');
  });

  test('Google sign-in button is visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.verifyGoogleLoginVisible();
  });

  test('Google sign-in button has correct text', async ({ page }) => {
    await expect(page.locator('#btn-google')).toHaveText(/Sign in with Google/);
  });

  test('Forgot password link is visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.verifyForgotPasswordLinkVisible();
  });

  test('Register link is visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.verifyRegisterLinkVisible();
  });

  test('Terms & Conditions link is visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.verifyTermsLinkVisible();
  });

  test('Privacy Policy link is visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.verifyPrivacyLinkVisible();
  });

  test('No error message shown on initial page load', async ({ page }) => {
    await expect(page.locator('#message_client')).not.toBeVisible();
  });

  test('Login Account heading is visible', async ({ page }) => {
    await expect(page.locator('h4:has-text("Login Account")')).toBeVisible();
  });

  test('Social media icons are visible', async ({ page }) => {
    await expect(page.locator('.social-media a, [class*="social"] a').first()).toBeVisible();
  });
});

test.describe('Login Page - Positive Flow', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop only test');

  test('User can login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    await loginPage.verifyLoginSuccess();
  });

  test('User is redirected to homepage after successful login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    await expect(page).toHaveURL(/rctiplus\.com\/?$/);
  });
});

test.describe('Login Page - Negative Flow', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop only test');

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('Login fails with invalid email and password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('invalid@email.com', 'WrongPassword999');
    await loginPage.verifyLoginFailed();
  });

  test('Login fails with wrong password shows error message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(VALID_EMAIL, 'WrongPassword999');
    await loginPage.verifyLoginFailed();
    await loginPage.verifyErrorMessage('Password Is Incorrect');
  });

  test('Login fails with non-existent email', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('nonexistent@test.com', 'Password123');
    await loginPage.verifyLoginFailed();
  });

  test('Login button becomes enabled after filling email and password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillEmailOrPhone(VALID_EMAIL);
    await loginPage.fillPassword(VALID_PASSWORD);
    await loginPage.verifyLoginButtonEnabled();
  });

  test('Login button remains disabled when only password is filled', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillPassword(VALID_PASSWORD);
    await loginPage.verifyLoginButtonDisabled();
  });

  test('Login button remains disabled when only email is filled', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillEmailOrPhone(VALID_EMAIL);
    await loginPage.verifyLoginButtonDisabled();
  });

  test('Login button remains disabled with password less than 8 characters', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillEmailOrPhone(VALID_EMAIL);
    await loginPage.fillPassword('Short1');
    await loginPage.verifyLoginButtonDisabled();
  });

  test('Login button enabled with password exactly 8 characters', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillEmailOrPhone(VALID_EMAIL);
    await loginPage.fillPassword('Pass1234');
    await loginPage.verifyLoginButtonEnabled();
  });

  test('Login button enabled with password more than 8 characters', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillEmailOrPhone(VALID_EMAIL);
    await loginPage.fillPassword('LongPassword123');
    await loginPage.verifyLoginButtonEnabled();
  });
});

test.describe('Login Page - Input Validation', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop only test');

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('Email input accepts valid email format', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillEmailOrPhone('user@example.com');
    await expect(loginPage['emailOrPhoneInput']).toHaveValue('user@example.com');
  });

  test('Email input accepts phone number format', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillEmailOrPhone('081234567890');
    await expect(loginPage['emailOrPhoneInput']).toHaveValue('081234567890');
  });

  test('Password input masks characters', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillPassword('SecretPass123');
    await loginPage.verifyPasswordIsMasked();
  });

  test('Input fields can be cleared and refilled', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillEmailOrPhone('first@test.com');
    await loginPage.fillEmailOrPhone('second@test.com');
    await expect(loginPage['emailOrPhoneInput']).toHaveValue('second@test.com');
  });

  test('Special characters accepted in password field', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillPassword('@Rhenot79!#$%');
    await expect(loginPage['passwordInput']).toHaveValue('@Rhenot79!#$%');
  });

  test('Email input accepts email with plus sign', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillEmailOrPhone('user+tag@example.com');
    await expect(loginPage['emailOrPhoneInput']).toHaveValue('user+tag@example.com');
  });

  test('Email input accepts email with dots', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillEmailOrPhone('user.name@example.com');
    await expect(loginPage['emailOrPhoneInput']).toHaveValue('user.name@example.com');
  });

  test('Password field accepts spaces', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillPassword('Pass word 123');
    await expect(loginPage['passwordInput']).toHaveValue('Pass word 123');
  });


  test('Password field handles unicode characters', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillPassword('Pässwörd123');
    await expect(loginPage['passwordInput']).toHaveValue('Pässwörd123');
  });
});

test.describe('Login Page - Keyboard Navigation', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop only test');

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });
});

test.describe('Login Page - Navigation', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop only test');

  test('Forgot password link navigates to correct page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.clickForgotPassword();
    await expect(page).toHaveURL(/.*forgot-password.*/);
  });

  test('Register link navigates to correct page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.clickRegister();
    await expect(page).toHaveURL(/.*register.*/);
  });

  test('Terms & Conditions link navigates to correct page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.clickTermsLink();
    await expect(page).toHaveURL(/.*terms.*/);
  });

  test('Privacy Policy link navigates to correct page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.clickPrivacyLink();
    await expect(page).toHaveURL(/.*privacy.*/);
  });

  test('Google login button navigates to Google auth', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.clickGoogleLogin();
    await expect(page).toHaveURL(/.*google.*/);
  });

  test('Forgot password link opens in same tab', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const target = await page.locator('#linkForgotPassword').getAttribute('target');
    expect(target).toBeNull();
  });

  test('Register link opens in same tab', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const target = await page.locator('a:has-text("Register here")').getAttribute('target');
    expect(target).toBeNull();
  });
});

test.describe('Login Page - Error Handling', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop only test');

  test('Error message appears after failed login attempt', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('wrong@email.com', 'WrongPass123');
    await loginPage.verifyErrorMessageVisible();
  });

  test('Error message contains relevant text', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('wrong@email.com', 'WrongPass123');
    await loginPage.verifyErrorMessage(/Password Is Incorrect|Invalid|incorrect/i);
  });

  test('Error message is displayed in a visible alert box', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('wrong@email.com', 'WrongPass123');
    const errorBox = page.locator('#message_client');
    await expect(errorBox).toBeVisible();
    const bgColor = await errorBox.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('Error message has red/pink background color', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('wrong@email.com', 'WrongPass123');
    const errorBox = page.locator('#message_client');
    await expect(errorBox).toBeVisible();
    const bgColor = await errorBox.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).toMatch(/rgb\(255|rgb\(248|rgba\(255/);
  });

  test('Form fields are cleared after failed login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('wrong@email.com', 'WrongPass123');
    await page.waitForTimeout(2000);
    const emailValue = await page.locator('input[name="username"]').inputValue();
    expect(emailValue).toBe('');
  });
});

test.describe('Login Page - Security', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop only test');

  test('Password is not visible in URL after login attempt', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    const url = page.url();
    expect(url).not.toContain(VALID_PASSWORD);
    expect(url).not.toContain('password');
  });

  test('Form uses POST method for submission', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const formMethod = await page.locator('#form').getAttribute('method');
    expect(formMethod?.toLowerCase()).toBe('post');
  });

  test('CSRF token is present in form', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const token = await page.locator('input[name="_token"]').getAttribute('value');
    expect(token).toBeTruthy();
    expect(token!.length).toBeGreaterThan(10);
  });

  test('Password field has autocomplete off or appropriate setting', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const autocomplete = await page.locator('input[name="password"]').getAttribute('autocomplete');
    expect(autocomplete === 'off' || autocomplete === 'current-password' || autocomplete === null).toBeTruthy();
  });

  test('Form action points to login endpoint', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const formAction = await page.locator('#form').getAttribute('action');
    expect(formAction).toContain('/login');
  });
});

test.describe('Login Page - Responsive Design', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop only test');

  test('Login page renders correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.verifyLoginPageVisible();
    await loginPage.verifyLoginButtonVisible();
  });

  test('Login page renders correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.verifyLoginPageVisible();
    await loginPage.verifyLoginButtonVisible();
  });
});

test.describe('Login Page - Accessibility', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop only test');

  test('Password input has associated label', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const labelFor = await page.locator('label').filter({ hasText: 'Password' }).first().getAttribute('for');
    expect(labelFor).toBe('password');
  });

  test('Login button is clickable', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.fillEmailOrPhone(VALID_EMAIL);
    await loginPage.fillPassword(VALID_PASSWORD);
    await loginPage.triggerLoginButton();
    await expect(page.locator('#btnLogin')).toBeEnabled();
  });
});