/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { expect, Locator, Page } from "@playwright/test";
// ☰ Enums
import {
  AppRoute,
  ButtonText,
  DataTestID,
  E2EValue,
  FormSection,
  FormTextOperation,
} from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });
// ☑️ Helpers

export class OperationPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.OPERATION;

  readonly buttonCancel: Locator;

  readonly buttonNext: Locator;

  readonly buttonSaveAndContinue: Locator;

  readonly buttonSubmit: Locator;

  readonly buttonToOperationsList: Locator;

  readonly fieldOperationName: Locator;

  readonly fieldPOCYes;

  readonly fieldPOCFirstName;

  readonly fieldPOCLastName;

  readonly fieldPOCPosition;

  readonly fieldPOCEmail;

  readonly fieldPOCPhone;

  readonly fieldSFO: Locator;

  readonly operationPage1Title: Locator;

  readonly operationPage2Title: Locator;

  readonly operationPage3Title: Locator;

  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.buttonCancel = page.getByRole("button", {
      name: ButtonText.CANCEL,
    });
    this.buttonNext = page.getByRole("button", {
      name: ButtonText.NEXT,
    });
    this.buttonSaveAndContinue = page.getByRole("button", {
      name: ButtonText.SAVE_CONTINUE,
    });
    this.buttonSubmit = page.getByRole("button", {
      name: ButtonText.SUBMIT,
    });
    this.buttonToOperationsList = page.getByRole("button", {
      name: ButtonText.RETURN_OPERATIONS,
    });
    this.fieldOperationName = page.getByPlaceholder(FormTextOperation.NAME);
    this.fieldSFO = page.getByPlaceholder(FormTextOperation.SFO);
    this.fieldSFO = page.fieldPOCYes.getByLabel;

    this.fieldSFO = page.fieldPOCFirstName.getByLabel;

    this.fieldSFO = page.fieldPOCLastName.getByLabel;

    this.fieldSFO = page.ieldPOCPosition.getByLabel;

    this.fieldSFO = page.fieldPOCEmail.getByLabel;

    this.fieldSFO = page.fieldPOCPhone.getByLabel;
    this.operationPage1Title = page
      .getByTestId("field-template-label")
      .getByText(FormSection.INFO_OPERATION);
    this.operationPage2Title = page
      .getByTestId("field-template-label")
      .getByText(FormSection.INFO_POINT_CONTACT);
    this.operationPage3Title = page
      .getByTestId("field-template-label")
      .getByText(FormSection.INFO_STATUTORY);

    this.table = page.locator(DataTestID.GRID);
  }

  // ###  Actions ###

  async clickCancelButton() {
    await this.buttonCancel.click();
  }

  async clickNextButton() {
    await this.buttonNext.click();
  }

  async clickSaveAndContinue() {
    await this.buttonSaveAndContinue.click();
  }

  async clickSubmitButton() {
    await this.buttonSubmit.click();
    await this.page.waitForResponse((response) => response.status() === 200, {
      timeout: 30000,
    });
  }

  async fillOperationFormPage1() {
    // Fill out the operation information form
    await this.fieldOperationName.fill(E2EValue.INPUT_OPERATION_NAME);

    await this.page.locator("#root_type").click();
    await this.fieldSFO.click();

    await this.page.getByTestId("root_naics_code_id").click();
    await this.page
      .getByRole("option", {
        name: E2EValue.FIXTURE_NAICS,
      })
      .click();
  }

  async fillOperationFormPage2() {
    // Fill out the point of contact form
    await this.fieldPOCYes.click();
    await this.fieldPOCFirstName.fill(E2EValue.INPUT_FIRST_NAME);
    await this.fieldPOCLastName.fill(E2EValue.INPUT_LAST_NAME);
    await this.fieldPOCPosition.fill(E2EValue.INPUT_POSITION);
    await this.fieldPOCEmail.fill(E2EValue.INPUT_EMAIL);
    await this.fieldPOCPhone.fill(E2EValue.INPUT_PHONE);
  }

  async route() {
    await this.page.goto(this.url);
  }

  // ###  Assertions ###

  async operationFormIsVisible() {
    const form = this.page.locator("form");
    await form.waitFor();
    await expect(this.operationPage1Title).toBeVisible();

    // Check for the presence of the multistep form headers
    expect(
      this.page
        .getByTestId("multistep-header-title")
        .getByText("Operation Information")
    ).toBeVisible();
    expect(
      this.page
        .getByTestId("multistep-header-title")
        .getByText("Point of Contact")
    ).toBeVisible();
    expect(
      this.page
        .getByTestId("multistep-header-title")
        .getByText("Statutory Declaration")
    ).toBeVisible();
  }

  async operationFormStep2IsVisible() {
    await expect(this.operationPage2Title).toBeVisible();
  }

  async operationFormStep3IsVisible() {
    await expect(this.operationPage3Title).toBeVisible();
  }

  async operationSuccessfulSubmissionIsVisible() {
    this.page.getByText(
      "Your application for the B.C. OBPS Regulated Operation ID for Test Operation Name has been received."
    );
    this.page.getByText(
      "Once approved, you will receive a confirmation email."
    );
    this.page.getByText(
      "You can then log back in and view the B.C. OBPS Regulated Operation ID for Test Operation Name."
    );
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = this.page.url();
    expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }
}
