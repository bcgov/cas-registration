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

  readonly buttonLoginBCeID: Locator;

  readonly buttonLoginIDIR: Locator;

  readonly linkLogout: Locator;

  readonly fieldUser: Locator;

  readonly fieldUserPassword: Locator;

  readonly textSSOLogout: Locator;

  constructor(page: Page) {
    this.page = page;

    this.buttonContinue = page.getByRole("button", {
      name: ActionButton.CONTINUE,
    });
    this.buttonLoginBCeID = this.page.getByRole("button", {
      name: Login.INDUSTRY_USER,
    });
    this.buttonLoginIDIR = this.page.getByRole("button", {
      name: Login.CAS,
    });
    this.linkLogout = page.getByRole("button", { name: Logout.OUT });
    this.fieldUser = this.page.locator(Keycloak.FIELD_USER_LOCATOR);
    this.fieldUserPassword = this.page.getByLabel(Keycloak.FIELD_PW_LOCATOR);
    this.textSSOLogout = page.locator("p", { hasText: Logout.SSO });
  }

  async route() {
    await this.page.goto(this.url);
  }

  async login(user: string, password: string, role: string) {
    // Determine the login button based on the user role
    switch (role) {
      case UserRole.INDUSTRY_USER_ADMIN:
      case UserRole.INDUSTRY_USER:
      case UserRole.NEW_USER:
        await this.buttonLoginBCeID.click();
        break;
      default:
        await this.buttonLoginIDIR.click();
        break;
    }
    // Fill the user field
    await this.fieldUser.fill(user, {
      timeout: 11000, // Keycloak so flaky, sooo flaky!
    });
    // Fill the pw field
    await this.fieldUserPassword.fill(password);
    // Click Continue button
    await this.buttonContinue.click();
  }

  async logout() {
    await this.linkLogout.click();
    await expect(this.textSSOLogout).toBeVisible();
  }

  async urlIsCorrect() {
    const path = AppRoute.HOME;
    const currentUrl = await this.page.url();
    await expect(currentUrl.toLocaleLowerCase()).toContain(path);
  }

  async userIsLoggedIn() {
    await this.page.waitForSelector(DataTestID.PROFILE, {
      timeout: 11000, // flaky keycloak!
    });
  }
}
