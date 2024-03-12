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
    // Get button element handle for states validation
    const buttonElement = await this.buttonSubmit.elementHandle();
    // Click the Submit button
    await this.buttonSubmit.click();
    if (buttonElement) {
      // Wait for loading state to be true based on buttonSubmit disabled
      await this.page.waitForFunction(() => buttonElement.isDisabled);
      // Wait for loading to complete
      await this.page.waitForLoadState("networkidle");
      // Wait for loading state to be false indicating create actionhandler has returned a response
      await this.page.waitForFunction(() => !buttonElement.isDisabled);
      // Assert no error alerts after loading completes
      const alertElement = await this.page.waitForSelector(
        DataTestID.PROFILE_ERROR,
        {
          state: "hidden",
        },
      );
      // Assert that the Alert element is not visible
      await expect(alertElement).toBeNull();
    } else {
      // eslint-disable-next-line no-console
      console.log("Submit button element handle not found");
      return false;
    }
    // If all actions succeed, return true
    return true;
  }

  async userFullNameIsCorrect(expectedText: string) {
    // Get the element handle
    const elementHandle: ElementHandle | null = await this.page.$(
      DataTestID.PROFILE,
    );
    // If elementHandle is null, return false
    if (!elementHandle) {
      return false;
    }
    // Get the text value of the profile link
    const actualText = (await elementHandle.textContent()) as string;
    await expect(actualText.toLowerCase()).toMatch(expectedText.toLowerCase());
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = await this.page.url();
    await expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }
}
