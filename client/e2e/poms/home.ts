/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import {
  ActionButton,
  AppRoute,
  DataTestID,
  Login,
  Logout,
  Keycloak,
  UserRole,
} from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class HomePOM {
  readonly page: Page;
  readonly url: string = process.env.E2E_BASEURL + AppRoute.HOME;
  readonly buttonContinue: Locator;
  readonly linkLogout: Locator;
  readonly fieldUser: Locator;
  readonly fieldUserPassword: Locator;
  readonly textSSOLogout: Locator;

  constructor(page: Page) {
    this.page = page;
    this.buttonContinue = page.getByRole("button", {
      name: ActionButton.CONTINUE,
    });
    this.linkLogout = page.getByRole("button", { name: Logout.OUT });
    this.fieldUser = this.page.locator(Keycloak.FIELD_USER_LOCATOR);
    this.fieldUserPassword = this.page.getByLabel(Keycloak.FIELD_PW_LOCATOR);
    this.textSSOLogout = page.locator("p", { hasText: Logout.SSO });
  }
  // 🛸 Navigate to this page url
  async route() {
    await this.page.goto(this.url);
  }
  // 🔑 Login to Keycloak
  async login(user: string, password: string, role: string) {
    // Determine the login button based on the user role
    let loginButton = Login.INDUSTRY_USER;
    switch (role) {
      case UserRole.CAS_PENDING:
        loginButton = Login.CAS;
        break;
    }
    // Click the login button
    await this.page.getByRole("button", { name: loginButton }).click();
    // Fill the user field
    await this.fieldUser.fill(user);
    // Fill the pw field
    await this.fieldUserPassword.fill(password);
    // Click Continue button
    await this.buttonContinue.click();
  }
  // 🔒 Logout of Keycloak
  async logout() {
    await this.linkLogout.click();
    await expect(this.textSSOLogout).toBeVisible();
  }
  // 🔍 Assert url reflects this page url
  async urlIsCorrect() {
    const path = AppRoute.HOME;
    await expect(this.url.toLocaleLowerCase()).toContain(path);
  }
  // 🕒 Wait for the profile navigation link to be visible
  async userIsLoggedIn() {
    await this.page.waitForSelector(DataTestID.PROFILE);
  }
}
