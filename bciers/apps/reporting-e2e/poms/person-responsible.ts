import { Page, expect } from "@playwright/test";
import {
  checkFormFieldsReadOnly,
  selectItemFromAutocomplete,
} from "@bciers/e2e/utils/helpers";

export class PersonResponsiblePOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async selectContact(contactName: string): Promise<void> {
    await selectItemFromAutocomplete(this.page, contactName);

    const [firstName, lastName] = contactName.split(" ");

    const firstNameField = this.page.getByLabel(/first name/i);
    const lastNameField = this.page.getByLabel(/last name/i);
    const jobTitleField = this.page.getByLabel(/job title \/ position/i);
    const emailField = this.page.getByLabel(/business email address/i);
    const phoneField = this.page.getByLabel(/business telephone number/i);
    const addressField = this.page.getByLabel(/business mailing address/i);
    const municipalityField = this.page.getByLabel(/municipality/i);
    const provinceField = this.page.getByLabel(/province/i);
    const postalCodeField = this.page.getByLabel(/postal code/i);

    // Verify the selected contact's name is populated
    await expect(firstNameField).toHaveValue(firstName);
    await expect(lastNameField).toHaveValue(lastName);

    // Verify remaining fields are populated
    await expect(jobTitleField).not.toHaveValue("");
    await expect(emailField).not.toHaveValue("");
    await expect(phoneField).not.toHaveValue("");
    await expect(addressField).not.toHaveValue("");
    await expect(municipalityField).not.toHaveValue("");
    await expect(provinceField).not.toHaveValue("");
    await expect(postalCodeField).not.toHaveValue("");

    // Verify all fields are read-only after population
    await checkFormFieldsReadOnly([
      firstNameField,
      lastNameField,
      jobTitleField,
      emailField,
      phoneField,
      addressField,
      municipalityField,
      provinceField,
      postalCodeField,
    ]);
  }
}
