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
  FormField,
} from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });
// ☑️ Helpers

export class OperationPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.OPERATION;

  readonly breadCrumbLast: Locator;

  readonly buttonCancel: Locator;

  readonly buttonNext: Locator;

  readonly buttonSaveAndContinue: Locator;

  readonly buttonSubmit: Locator;

  readonly buttonToOperationsList: Locator;

  readonly fieldOperationName: Locator;

  readonly fieldOperationType: Locator;

  readonly fieldNAICSCode: Locator;

  readonly fieldNAICSCodeOption: Locator;

  readonly fieldPOCYes;

  readonly fieldPOCFirstName;

  readonly fieldPOCLastName;

  readonly fieldPOCPosition;

  readonly fieldPOCEmail;

  readonly fieldPOCPhone;

  readonly formHeaderOperation: Locator;

  readonly formHeaderPOC: Locator;

  readonly formHeaderStatutory: Locator;

  readonly formPage1Title: Locator;

  readonly formPage2Title: Locator;

  readonly formPage3Title: Locator;

  readonly messageBoroIdRequested: Locator;

  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.breadCrumbLast = page.getByTestId(DataTestID.BREADCRUMB_LAST);
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

    this.fieldNAICSCode = page.getByTestId(FormField.NAICS_CODE);
    this.fieldNAICSCodeOption = page.getByRole("option", {
      name: E2EValue.FIXTURE_NAICS,
    });
    this.fieldOperationName = page.getByLabel(FormField.OPERATION_NAME);
    this.fieldOperationType = page.getByLabel(FormField.OPERATION_TYPE);
    this.fieldPOCYes = page.getByLabel(FormField.YES);
    this.fieldPOCFirstName = page.getByLabel(FormField.FIRST_NAME);
    this.fieldPOCLastName = page.getByLabel(FormField.LAST_NAME);
    this.fieldPOCPosition = page.getByLabel(FormField.POSITION);
    this.fieldPOCEmail = page.getByLabel(FormField.EMAIL);
    this.fieldPOCPhone = page.getByLabel(FormField.PHONE);
    this.formHeaderOperation = page
      .getByTestId(DataTestID.OPERATION_HEADER_TEMPLATE)
      .getByText(FormSection.INFO_OPERATION);
    this.formHeaderPOC = page
      .getByTestId(DataTestID.OPERATION_HEADER_TEMPLATE)
      .getByText(FormSection.INFO_POINT_CONTACT);
    this.formHeaderStatutory = page
      .getByTestId(DataTestID.OPERATION_HEADER_TEMPLATE)
      .getByText(FormSection.INFO_STATUTORY_DECLARATION);
    this.formPage1Title = page
      .getByTestId(DataTestID.OPERATION_FIELD_TEMPLATE)
      .getByText(FormSection.INFO_OPERATION);
    this.formPage2Title = page
      .getByTestId(DataTestID.OPERATION_FIELD_TEMPLATE)
      .getByText(FormSection.INFO_POINT_CONTACT);
    this.formPage3Title = page
      .getByTestId(DataTestID.OPERATION_FIELD_TEMPLATE)
      .getByText(FormSection.INFO_STATUTORY_DECLARATION);
    this.messageBoroIdRequested = this.table = page.getByTestId(
      DataTestID.OPERATION_BORO_ID_MESSAGE,
    );
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
    const responsePromise = this.page.waitForResponse(
      (response) => response.status() === 200,
    );
    await this.buttonSubmit.click();
    await responsePromise;
  }

  async formFillPage1() {
    // Fill out the operation information form
    await this.fieldNAICSCode.click();
    await this.fieldNAICSCodeOption.click(); // filling NAICS code first so it has time to settle before the happo screenshot
    await this.fieldOperationName.fill(E2EValue.INPUT_OPERATION_NAME);
    await this.fieldOperationType.fill(E2EValue.FIXTURE_SFO);
  }

  async formFillPage2() {
    // Fill out the point of contact form
    await this.fieldPOCYes.click();
    await this.fieldPOCFirstName.fill(E2EValue.INPUT_FIRST_NAME);
    await this.fieldPOCLastName.fill(E2EValue.INPUT_LAST_NAME);
    await this.fieldPOCPosition.fill(E2EValue.INPUT_POSITION);
    await this.fieldPOCEmail.fill(E2EValue.INPUT_EMAIL);
    await this.fieldPOCPhone.fill(E2EValue.INPUT_PHONE);
  }

  async lastBreadcrumbIsVisible() {
    // Check for the presence of the breadcrumb since it
    // can take a second to load in and cause screenshot diffs
    await expect(this.breadCrumbLast).toBeVisible();
  }

  async route() {
    await this.page.goto(this.url);
  }

  // ###  Assertions ###

  async formIsVisible() {
    await this.lastBreadcrumbIsVisible();
    await expect(this.formPage1Title).toBeVisible();
    // Check for the presence of the multistep form headers
    await expect(this.formHeaderOperation).toBeVisible();
    await expect(this.formHeaderPOC).toBeVisible();
    await expect(this.formHeaderStatutory).toBeVisible();
  }

  async formStep2IsVisible() {
    await this.lastBreadcrumbIsVisible();
    await expect(this.formPage2Title).toBeVisible();
  }

  async formStep3IsVisible() {
    await this.lastBreadcrumbIsVisible();
    await expect(this.formPage3Title).toBeVisible();
  }

  async successfulSubmissionIsVisible() {
    await expect(this.messageBoroIdRequested).toBeVisible();
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = this.page.url();
    expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }
}
