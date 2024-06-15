/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ⛏️ Helpers
import {
  fieldsClear,
  fillRequiredFormFields,
  getFieldAlerts,
  getFieldRequired,
} from "@/e2e/utils/helpers";
// ☰ Enums
import { AppRoute, ButtonText, DataTestID } from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class ProfilePOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.PROFILE;

  readonly buttonSubmit: Locator;

  readonly errorList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.buttonSubmit = page.getByRole("button", {
      name: ButtonText.SUBMIT,
    });
    this.errorList = page.getByTestId(DataTestID.ERROR_PROFILE);
  }

  // ###  Actions ###
  async route() {
    await this.page.goto(this.url);
  }

  // ###  Assertions ###

  async updateFail() {
    // Clear all required fields
    const requiredFields = await getFieldRequired(this.page);
    await fieldsClear(this.page, requiredFields);
    // Click the Submit button
    await this.buttonSubmit.click();
    // Locate all alert elements within the fieldset
    const alertElements = await getFieldAlerts(this.page);
    // Assert there to be exactly the same number of required fields and alert elements
    await expect(requiredFields.length).toBe(alertElements.length);
  }

  async updateSuccess() {
    // Update all required fields
    await fillRequiredFormFields(this.page);
    // Click the Submit button
    await this.buttonSubmit.click();
    // Wait for API request/response
    await this.buttonSubmit.isDisabled();
    await this.buttonSubmit.isEditable();
    // Assert that the error list is not available
    await expect(this.errorList).toBeHidden();
  }

  async userFullNameIsCorrect(expectedText: string) {
    // Waits for the profile link to appear with the expected text
    await this.page.getByTestId(
      `${DataTestID.PROFILE}:has-text("${expectedText}")`,
    );
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = await this.page.url();
    await expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }
}
