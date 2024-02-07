/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ⛏️ Helpers
import { getFieldRequired } from "@/e2e/utils/helpers";
import { ActionButton } from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class ProfilePOM {
  readonly page: Page;
  readonly url: string = process.env.E2E_BASEURL + "profile";
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
  async update() {
    // Locate all required fields within the fieldset
    const requiredFields = await getFieldRequired(this.page);
    if (requiredFields) {
      //  Set required input fields
      for (const input of requiredFields) {
        const labelText = await input.textContent();
        const inputField = await this.page.getByLabel(labelText as string);
        // Click the field to focus it
        await inputField.click();
        if (labelText === "Phone Number*") {
          await this.page.getByLabel(labelText).fill("987 654 3210"); //Format should be ### ### ####
        } else {
          await inputField.fill(`E2E TEST ${labelText}`);
        }
      }
    }
    await this.buttonSubmit.click();
  }
}
