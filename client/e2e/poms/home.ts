/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";

// ☰ Enums
import {
  AppRoute,
  ButtonText,
  DataTestID,
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

  readonly linkProfile: Locator;

  readonly fieldUser: Locator;

  readonly fieldUserPassword: Locator;

  readonly textSSOLogout: Locator;

  constructor(page: Page) {
    this.page = page;

    this.buttonContinue = page.getByRole("button", {
      name: ButtonText.CONTINUE,
    });
    this.buttonLoginBCeID = page.getByRole("button", {
      name: ButtonText.LOGIN_INDUSTRY_USER,
    });
    this.buttonLoginIDIR = page.getByRole("button", {
      name: ButtonText.LOGIN_CAS,
    });
    this.linkProfile = page.getByTestId(DataTestID.PROFILE).first();
    this.fieldUser = page.locator(Keycloak.FIELD_USER_LOCATOR);
    this.fieldUserPassword = page.getByLabel(Keycloak.FIELD_PW_LOCATOR);
    this.textSSOLogout = page.locator("p", { hasText: ButtonText.LOGOUT_SSO });
  }

  // ###  Actions ###

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

  async route() {
    await this.page.goto(this.url);
  }

  // ###  Assertions ###

  async urlIsCorrect() {
    const path = AppRoute.HOME;
    const currentUrl = await this.page.url();
    await expect(currentUrl.toLocaleLowerCase()).toContain(path);
  }

  async userIsLoggedIn() {
    await expect(this.linkProfile).toBeVisible();
  }

  async userRoleIsCorrect(role: UserRole) {
    await expect(this.page.getByTestId(role).first()).toBeVisible();
  }
}
