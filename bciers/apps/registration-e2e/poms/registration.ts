/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import { RegistrationPurposes } from "@/registration/app/components/operations/registration/enums";
import { ContactE2EValue } from "@/administration-e2e/utils/enums";
import {
  checkAllRadioButtons,
  clickButton,
  fillComboxboxWidget,
  fillDropdownByLabel,
} from "@bciers/e2e/utils/helpers";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
// import path from "path";
import { uploadFile } from "@bciers/e2e/utils/helpers";
dotenv.config({ path: "./e2e/.env.local" });

export class RegistrationPOM {
  readonly page: Page;

  readonly initialUrl: string =
    process.env.E2E_BASEURL + "registration/register-an-operation";

  readonly saveAndContinueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.saveAndContinueButton = page.getByRole("button", {
      name: /save and continue/i,
    });
  }

  // ###  Actions ###

  async route() {
    await this.page.goto(this.initialUrl);
  }

  async clickSaveAndContinue() {
    await this.saveAndContinueButton.click();
  }

  // Registration-specific form-filling functions
  async fillNewOperationInformation(registrationPurpose: RegistrationPurposes) {
    await fillComboxboxWidget(
      this.page,
      /The purpose of this registration is+/i,
      registrationPurpose,
    );
    await fillComboxboxWidget(
      this.page,
      /regulated product+/i,
      "Gypsum wallboard",
    );
    await fillComboxboxWidget(
      this.page,
      /reporting activities+/i,
      "Cement production",
    );
    await this.page.getByLabel(/operation name+/i).fill("n");
    await fillDropdownByLabel(
      this.page,
      /operation type+/i,
      "Single Facility Operation",
    );
    await fillComboxboxWidget(
      this.page,
      /primary naics+/i,
      "212114 - Bituminous coal mining",
    );
    await uploadFile(this.page, 0); // process flow diagram
    await uploadFile(this.page, 1); // boundary map
  }

  async fillExistingOperationInformation(
    registrationPurpose: RegistrationPurposes,
  ) {
    // select an existing operation (operations come from the mock dev data)
    await fillComboxboxWidget(
      this.page,
      /select your operation+/i,
      "Blue LFO - Not Started",
    );
    // the next two lines ensure Blue LFO's data is fetched before continuing to fill the form
    const input = this.page.getByRole("combobox", {
      name: /primary naics+/i,
    });
    await expect(input).toHaveValue(
      "325181 - Alkali and chlorine manufacturing",
    );

    // fill the reg purpose section
    await fillComboxboxWidget(
      this.page,
      /The purpose of this registration is+/i,
      registrationPurpose,
    );
    await expect(this.page.getByText(registrationPurpose)).toBeVisible();

    await fillComboxboxWidget(
      this.page,
      /regulated product+/i,
      "Gypsum wallboard",
    );
    await fillComboxboxWidget(
      this.page,
      /reporting activities+/i,
      "Cement production",
    );

    // files cannot be included in mock data, so even though a real existing operation would have them uploaded already, we upload in the e2e tests
    await uploadFile(this.page, 0); // process flow diagram
    await uploadFile(this.page, 1); // boundary map
  }

  async fillSfoFacilityInformation() {
    await this.page.getByLabel(/latitude+/i).fill("48.433");
    await this.page.getByLabel(/longitude+/i).fill("123.350");
  }

  async fillLfoFacilityInformation() {
    await clickButton(this.page, /add new facility/i);
    await this.page.getByLabel(/facility name\*/i).fill("a");
    await fillComboxboxWidget(this.page, /facility type+/i, "Small Aggregate");
  }

  async fillOptInInformation(page) {
    await checkAllRadioButtons(page);
  }

  async fillNewEntrantInformation() {
    await uploadFile(this.page, 0); // new entrant application
  }

  async fillNewOperationRepresentative() {
    await this.page.getByLabel(/first+/i).fill(ContactE2EValue.FIRST_NAME);
    await this.page.getByLabel(/last+/i).fill(ContactE2EValue.LAST_NAME);
    await this.page.getByLabel(/job title+/i).fill(ContactE2EValue.POSITION);
    await this.page
      .getByLabel(/business email+/i)
      .fill(ContactE2EValue.EMAIL_ADDRESS);
    await this.page
      .getByLabel(/business telephone+/i)
      .fill(ContactE2EValue.TELEPHONE_NUMBER);
    await this.page
      .getByLabel(/business mailing+/i)
      .fill(ContactE2EValue.MAILING_ADDRESS);
    await this.page
      .getByLabel(/municipality+/i)
      .fill(ContactE2EValue.MUNICIPALITY);
    await fillComboxboxWidget(
      this.page,
      /province+/i,
      ContactE2EValue.PROVINCE,
    );
    await this.page
      .getByLabel(/postal code+/i)
      .fill(ContactE2EValue.POSTAL_CODE);
    await clickButton(this.page, /save operation representative/i);
  }

  async fillExistingOperationRepresentative() {
    // existing contacts come from the mock dev data
    await fillComboxboxWidget(
      this.page,
      /select existing contact+/i,
      "Bill Blue",
    );
    // this ensures Bill Blue's data is fetched before continuing to fill the form
    await expect(this.page.getByLabel(/postal code/i)).toHaveValue("A1B  2C3");
    await clickButton(this.page, /save operation representative/i);
  }

  async fillSubmission() {
    await this.page
      .getByRole("checkbox", {
        name: /I certify that+/i,
      })
      .check();
    await this.page
      .getByRole("checkbox", {
        name: /I understand that the Ministry responsible+/i,
      })
      .check();
    await this.page
      .getByRole("checkbox", {
        name: /I understand that this information is being collected+/i,
      })
      .check();
  }

  async waitForRegistrationUrl(step: number) {
    const mockUuid = "[0-9a-fA-F-]+";
    await this.page.waitForURL(
      new RegExp(`registration/register-an-operation/${mockUuid}/${step}+`),
      {
        waitUntil: "load",
      },
    );
  }

  // ###  Assertions ###

  async assertHeading(heading) {
    await expect(this.page.getByTestId("field-template-label")).toHaveText(
      heading,
    );
  }
}
