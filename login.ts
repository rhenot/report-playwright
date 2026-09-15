import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Login Regression', () => {

  test('User can login successfully', async ({ page }) => {

    const loginPage = new LoginPage(page);

    await loginPage.goto();

    await loginPage.clickLoginButton();

    await loginPage.login(
      'testing@mail.com',
      'Password123'
    );

    await loginPage.verifyLoginSuccess();
  });

});