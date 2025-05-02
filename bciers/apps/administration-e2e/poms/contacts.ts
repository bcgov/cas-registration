/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import {
  AppRoute,
  ContactFormField,
  ContactE2EValue,
} from "@/administration-e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class ContactsPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.CONTACTS;

  // Field Locators

  readonly fieldFirstName: Locator;

  readonly fieldLastName: Locator;

  readonly fieldPosition: Locator;

  readonly fieldEmailAddress: Locator;

  readonly fieldTelephoneNumber: Locator;

  readonly fieldMailingAddress: Locator;

  readonly fieldMunicipality: Locator;

  readonly fieldProvince: String;

  readonly fieldPostalCode: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize field locators
    this.fieldFirstName = page.getByLabel(ContactFormField.FIRST_NAME);

    this.fieldLastName = page.getByLabel(ContactFormField.LAST_NAME);

    this.fieldPosition = page.getByLabel(ContactFormField.POSITION);

    this.fieldEmailAddress = page.getByLabel(ContactFormField.EMAIL_ADDRESS);

    this.fieldTelephoneNumber = page.getByLabel(
      ContactFormField.TELEPHONE_NUMBER,
    );

    this.fieldMailingAddress = page.getByLabel(
      ContactFormField.MAILING_ADDRESS,
    );

    this.fieldMunicipality = page.getByLabel(ContactFormField.MUNICIPALITY);

    this.fieldPostalCode = page.getByLabel(ContactFormField.POSTAL_CODE);
  }

  // ###  Actions ###

  async route() {
    await this.page.goto(this.url);
    await this.page.waitForTimeout(500);
  }

  async fillFields(
    fieldLabels: string[],
    values: { [key: string]: string },
    mode: "fill" | "read" = "fill",
  ) {
    for (const labelText of fieldLabels) {
      const inputFields = this.page.getByLabel(labelText);
      const inputField = inputFields.nth((await inputFields.count()) - 1);
      if (mode === "fill") {
        const currentValue = await inputField.inputValue();
        if (currentValue) {
          await inputField.clear();
        }

        if (labelText === ContactFormField.PROVINCE) {
          await inputField.fill(values[labelText]);
          await this.page
            .getByRole("option", { name: values[labelText] })
            .click();
        } else {
          await inputField.fill(values[labelText]);
        }
      } else if (mode === "read") {
        const expectedValue =
          labelText === ContactFormField.TELEPHONE_NUMBER
            ? `+1 ${values[labelText]}`
            : values[labelText];
        const text = await this.page.getByText(expectedValue, { exact: true });
        await expect(text).toBeVisible();
      }
    }
  }

  async contactInformation(mode: "fill" | "read") {
    const requiredFields = [
      ContactFormField.FIRST_NAME,
      ContactFormField.LAST_NAME,
      ContactFormField.POSITION,
      ContactFormField.EMAIL_ADDRESS,
      ContactFormField.TELEPHONE_NUMBER,
      ContactFormField.MAILING_ADDRESS,
      ContactFormField.MUNICIPALITY,
      ContactFormField.POSTAL_CODE,
      ContactFormField.PROVINCE,
    ];

    const requiredValues = {
      [ContactFormField.FIRST_NAME]: ContactE2EValue.FIRST_NAME,
      [ContactFormField.LAST_NAME]: ContactE2EValue.LAST_NAME,
      [ContactFormField.POSITION]: ContactE2EValue.POSITION,
      [ContactFormField.EMAIL_ADDRESS]: ContactE2EValue.EMAIL_ADDRESS,
      [ContactFormField.TELEPHONE_NUMBER]: ContactE2EValue.TELEPHONE_NUMBER,
      [ContactFormField.MAILING_ADDRESS]: ContactE2EValue.MAILING_ADDRESS,
      [ContactFormField.MUNICIPALITY]: ContactE2EValue.MUNICIPALITY,
      [ContactFormField.POSTAL_CODE]: ContactE2EValue.POSTAL_CODE,
      [ContactFormField.PROVINCE]: ContactE2EValue.PROVINCE,
    };

    await this.fillFields(requiredFields, requiredValues, mode);
  }

  async searchContactsGrid(email: string) {
    await this.page
      .getByLabel(/Business Email Address/i)
      .getByPlaceholder(/Search/i)
      .fill(email);

    const row = this.page.getByRole("row").filter({ hasText: email });

    await expect(row.first()).toBeVisible();
    return row;
  }

  // ###  Assertions ###

  async urlIsCorrect() {
    const path = await this.url;
    const currentUrl = await this.page.url();
    expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }
}
