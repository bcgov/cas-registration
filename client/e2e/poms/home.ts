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
  LoginLink,
  UserRole,
} from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class HomePOM {
  readonly page: Page;
  readonly url: string = process.env.E2E_BASEURL as string;
  readonly buttonLogout: Locator;

  constructor(page: Page) {
    this.page = page;
    this.buttonLogout = page.getByRole("button", { name: LoginLink.OUT });
  }
  async route() {
    await this.page.goto(this.url);
  }
  async login(user: string, password: string, role: string) {
    // Determine the login button based on the user role
    let loginButton = LoginLink.INDUSTRY_USER;
    switch (role) {
      case UserRole.CAS_PENDING:
        loginButton = LoginLink.CAS;
        break;
    }
    // Click the login button
    await this.page.getByRole("button", { name: loginButton }).click();
    // 🔑 Login to Keycloak
    // Fill the user field
    await this.page.locator("id=user").fill(user);
    // Fill the pw field
    await this.page.getByLabel("Password").fill(password);
    // Click Continue button
    await this.page
      .getByRole("button", { name: ActionButton.CONTINUE })
      .click();
  }
  async isCorrectUrl() {
    // 🔍 Assert that the current URL ends as expected
    const path = AppRoute.HOME;
    await expect(this.page.url().toLocaleLowerCase()).toContain(path);
  }
  async isLoggedIn() {
    // 🔍 Assert user profile link is visible
    // 🚩 BP approach (?) seems to fail: await expect(page.getByTestId("nav-user-profile")).toBeVisible();
    const profileNavSelector = DataTestID.PROFILE;
    await this.page.waitForSelector(profileNavSelector);
    // 🔍 Assert that the link is available
    expect(profileNavSelector).not.toBeNull();
  }
}
