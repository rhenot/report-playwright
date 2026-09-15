import { Page, expect } from '@playwright/test';

export class LoginPage {
  private readonly emailOrPhoneInput = this.page.locator('input[name="username"]');
  private readonly passwordInput = this.page.locator('input[name="password"]');
  private readonly loginButtonReal = this.page.locator('#btnLogin');
  private readonly loginButtonFake = this.page.locator('#btnLogin-ahref');
  private readonly googleLoginButton = this.page.locator('#btn-google, a:has-text("Sign in with Google")');
  private readonly forgotPasswordLink = this.page.locator('#linkForgotPassword');
  private readonly registerLink = this.page.locator('a:has-text("Register here")');
  private readonly passwordToggle = this.page.locator('.toggle-password, input[name="password"] + *');
  private readonly termsLink = this.page.locator('a[href*="terms"]');
  private readonly privacyLink = this.page.locator('a[href*="privacy"]');
  private readonly errorMessage = this.page.locator('#message_client, [class*="alert"], [class*="error"]');
  private readonly loginCard = this.page.locator('.card-login');

  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async login(emailOrPhone: string, password: string) {
    await this.emailOrPhoneInput.click();
    await this.emailOrPhoneInput.pressSequentially(emailOrPhone, { delay: 30 });
    await this.passwordInput.click();
    await this.passwordInput.pressSequentially(password, { delay: 30 });
    await this.page.evaluate(() => (window as any).openButtonLogin());
    await this.loginButtonReal.click();
  }

  async fillEmailOrPhone(value: string) {
    await this.emailOrPhoneInput.click();
    await this.emailOrPhoneInput.fill('');
    await this.emailOrPhoneInput.pressSequentially(value, { delay: 30 });
  }

  async fillPassword(value: string) {
    await this.passwordInput.click();
    await this.passwordInput.fill('');
    await this.passwordInput.pressSequentially(value, { delay: 30 });
  }

  async getEmailOrPhoneValue() {
    return this.emailOrPhoneInput.inputValue();
  }

  async getPasswordValue() {
    return this.passwordInput.inputValue();
  }

  async triggerLoginButton() {
    await this.page.evaluate(() => (window as any).openButtonLogin());
  }

  async clickLoginButton() {
    await this.loginButtonReal.click();
  }

  async clickGoogleLogin() {
    await this.googleLoginButton.click();
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async clickRegister() {
    await this.registerLink.click();
  }

  async clickTermsLink() {
    await this.termsLink.click();
  }

  async clickPrivacyLink() {
    await this.privacyLink.click();
  }

  async togglePasswordVisibility() {
    await this.passwordToggle.click();
  }

  async verifyLoginPageVisible() {
    await expect(this.emailOrPhoneInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  async verifyLoginButtonVisible() {
    await expect(this.loginButtonFake).toBeVisible();
  }

  async verifyLoginButtonDisabled() {
    const style = await this.loginButtonFake.getAttribute('style');
    expect(style).toContain('pointer-events: none');
  }

  async verifyLoginButtonEnabled() {
    await this.triggerLoginButton();
    await expect(this.loginButtonReal).toBeVisible();
  }

  async verifyLoginButtonHasText(text: string) {
    await expect(this.loginButtonFake).toHaveText(text);
  }

  async verifyLoginSuccess() {
    await expect(this.page).not.toHaveURL(/.*login.*message_client/);
  }

  async verifyLoginFailed() {
    await expect(this.page).toHaveURL(/.*login.*message_client/);
  }

  async verifyGoogleLoginVisible() {
    await expect(this.googleLoginButton).toBeVisible();
  }

  async verifyForgotPasswordLinkVisible() {
    await expect(this.forgotPasswordLink).toBeVisible();
  }

  async verifyRegisterLinkVisible() {
    await expect(this.registerLink).toBeVisible();
  }

  async verifyTermsLinkVisible() {
    await expect(this.termsLink.first()).toBeVisible();
  }

  async verifyPrivacyLinkVisible() {
    await expect(this.privacyLink.first()).toBeVisible();
  }

  async verifyErrorMessageVisible() {
    await expect(this.errorMessage.first()).toBeVisible();
  }

  async verifyPasswordIsMasked() {
    const type = await this.passwordInput.getAttribute('type');
    expect(type).toBe('password');
  }

  async verifyPageTitle(expectedTitle: string | RegExp) {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  async verifyLoginCardVisible() {
    await expect(this.loginCard).toBeVisible();
  }

  async verifyEmailInputLabel() {
    await expect(this.page.locator('label').filter({ hasText: 'Email or Phone Number' }).first()).toBeVisible();
  }

  async verifyPasswordInputLabel() {
    await expect(this.page.locator('label').filter({ hasText: 'Password' }).first()).toBeVisible();
  }

  async verifyErrorMessage(expectedText: string | RegExp) {
    await expect(this.page.getByText(expectedText).first()).toBeVisible();
  }
}
