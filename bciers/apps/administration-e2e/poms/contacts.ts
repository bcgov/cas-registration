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
  ContactButtonText,
  ContactFootnote,
} from "@/administration-e2e/utils/enums";
import {
  fillRequiredFormFields,
  clickWithRetry,
  checkBreadcrumbText,
} from "@bciers/e2e/utils/helpers";
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

    await fillRequiredFormFields(
      this.page,
      requiredFields,
      requiredValues,
      mode,
    );
  }

  async assertBreadcrumbIsCorrect() {
    const text = `${ContactE2EValue.FIRST_NAME} ${ContactE2EValue.LAST_NAME}`;
    await checkBreadcrumbText(this.page, text);
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

  async clickAddButton() {
    const addButton = ContactButtonText.ADD_CONTACT;
    await this.page.waitForTimeout(5000);
    await expect(
      this.page.getByRole("button", { name: addButton }),
    ).toBeVisible();
    // Click the button
    await clickWithRetry(this.page, addButton, 3);
    await this.assertFootnoteIsVisible(true);
  }

  // ###  Assertions ###

  async urlIsCorrect() {
    const path = await this.url;
    const currentUrl = await this.page.url();
    expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }

  async assertFootnoteIsVisible(input: boolean) {
    const footnote = ContactFootnote.CONTACT_FOOTNOTE;
    if (input) {
      await this.page.waitForSelector(`text=/${footnote}/i`, { timeout: 5000 });
    } else {
      await expect(this.page.getByText(footnote)).toBeHidden();
    }
  }
}
