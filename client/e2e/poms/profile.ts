/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { ElementHandle, Locator, Page, expect } from "@playwright/test";
// ⛏️ Helpers
import { fieldsClear, fieldsUpdate, getFieldAlerts } from "@/e2e/utils/helpers";
// ☰ Enums
import { AppRoute, ActionButton, DataTestID } from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class ProfilePOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.PROFILE;

  readonly buttonSubmit: Locator;

  constructor(page: Page) {
    this.page = page;
    this.buttonSubmit = this.page.getByRole("button", {
      name: ActionButton.SUBMIT,
    });
  }

  async route() {
    await this.page.goto(this.url);
  }

  async updateFail() {
    // Clear all required fields
    const clearedFields = await fieldsClear(this.page);
    // Click the Submit button
    await this.buttonSubmit.click();
    // Locate all alert elements within the fieldset
    const alertElements = await getFieldAlerts(this.page);
    // 🔍 Assert there to be exactly the same number of required fields and alert elements
    await expect(clearedFields).toBe(alertElements.length);
  }

  async updateSuccess() {
    // Update all required fields
    await fieldsUpdate(this.page);
    // Click the Submit button
    await this.buttonSubmit.click();
    // Response from submit either shows errors or triggeres handleSubmit which handles state changes on submit button etc.
    // 🔍 Assert that the error selector is not available
    await this.page.waitForSelector(DataTestID.ERROR_PROFILE, {
      state: "hidden",
    });
    const notFoundSelector = await this.page.$(DataTestID.ERROR_PROFILE);
    expect(notFoundSelector).toBeFalsy();
  }

  async userFullNameIsCorrect(expectedText: string) {
    // Waits for the selector to appear with the expected text
    await this.page.waitForSelector(
      `${DataTestID.PROFILE}:has-text("${expectedText}")`
    );
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = await this.page.url();
    await expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }
}
