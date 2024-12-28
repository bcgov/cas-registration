/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import {
  AppRoute,
  ButtonText,
  E2EValue,
  FormField,
  MessageTextOperator,
  MessageTextOperatorSelect,
} from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
import {
  checkFormFieldsReadOnly,
  fillAllFormFields,
  getAllFormInputs,
} from "@/e2e/utils/helpers";
dotenv.config({ path: "./e2e/.env.local" });

export class OperatorPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.OPERATOR;

  readonly buttonAddParentCompany: Locator;

  readonly buttonEdit: Locator;

  readonly buttonRequestAccess: Locator;

  readonly buttonRequestAdministratorAccess: Locator;

  readonly buttonSaveAndReturn: Locator;

  readonly buttonSelectOperator: Locator; // legal name search

  readonly buttonSearchOperator: Locator; // CRA number search

  readonly buttonSubmit: Locator;

  readonly buttonYesThisIsMyOperator: Locator;

  readonly fieldBCCrn: Locator;

  readonly fieldHasParentCompany: Locator;

  readonly fieldLegalName: Locator;

  readonly fieldPostal: Locator;

  readonly fieldSelectCRA: Locator;

  readonly fieldSelectLegalName: Locator;

  readonly fieldSearchByCRA: Locator;

  readonly fieldWebSite: Locator;

  readonly form: Locator;

  readonly formTitle: Locator;

  readonly linkAddOperator: Locator;

  readonly linkGoBack: Locator;

  readonly linkReturn: Locator;

  readonly messageAccessRequested: Locator;

  readonly messageAddOperatorRequested: Locator;

  readonly messageEditInformation: Locator;

  readonly messageAdministratorRequested: Locator;

  readonly messageConfirmation: Locator;

  readonly messageNoAccess: Locator;

  readonly messageNoAdminSetup: Locator;

  readonly messageSelectOperator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.buttonAddParentCompany = page.getByRole("button", {
      name: ButtonText.ADD_PARENT_COMPANY,
    });
    this.buttonEdit = page.getByRole("button", {
      name: ButtonText.EDIT,
    });
    this.buttonRequestAccess = page.getByRole("button", {
      name: ButtonText.REQUEST_ACCESS,
    });
    this.buttonRequestAdministratorAccess = page.getByRole("button", {
      name: ButtonText.REQUEST_ADMIN_ACCESS,
    });
    this.buttonSaveAndReturn = page.getByRole("button", {
      name: ButtonText.SAVE_RETURN_DASHBOARD,
    });
    this.buttonSelectOperator = page.getByRole("button", {
      name: ButtonText.SELECT_OPERATOR,
    });
    this.buttonSearchOperator = page.getByRole("button", {
      name: ButtonText.SEARCH_OPERATOR,
    });
    this.buttonSubmit = page.getByRole("button", {
      name: ButtonText.SUBMIT,
    });
    this.buttonYesThisIsMyOperator = page.getByRole("button", {
      name: ButtonText.YES_OPERATOR,
    });
    this.fieldBCCrn = page.getByLabel(FormField.BC_CRN);
    this.fieldLegalName = page.getByLabel(FormField.LEGAL_NAME);
    this.fieldHasParentCompany = page.locator(FormField.HAS_PARENT_COMPANY);
    this.fieldPostal = page.getByLabel(FormField.POSTAL_CODE);
    this.fieldSelectCRA = page.getByPlaceholder(FormField.PLACEHOLDER_CRA);
    this.fieldSelectLegalName = page.getByPlaceholder(
      FormField.PLACEHOLDER_LEGAL_NAME,
    );
    this.fieldSearchByCRA = page.getByLabel(FormField.SEARCH_BY_CANADA_REVENUE);
    this.fieldWebSite = page.getByLabel(FormField.WEB_SITE);
    this.form = page.locator(FormField.FORM);
    this.formTitle = page.getByText(FormField.TITLE);

    this.linkAddOperator = page.getByRole("link", {
      name: ButtonText.ADD_OPERATOR,
    });
    this.linkGoBack = page.getByRole("link", {
      name: ButtonText.GO_BACK,
    });
    this.linkReturn = page.getByText(ButtonText.RETURN);
    this.messageAccessRequested = page.getByText(
      new RegExp(MessageTextOperatorSelect.REQUEST_ACCESS, "i"),
    );
    this.messageAddOperatorRequested = page.getByText(
      new RegExp(MessageTextOperatorSelect.REQUEST_ADD, "i"),
    );
    this.messageAdministratorRequested = page.getByText(
      new RegExp(MessageTextOperatorSelect.REQUEST_ADMIN, "i"),
    );
    this.messageConfirmation = page.getByText(
      new RegExp(MessageTextOperatorSelect.OPERATOR_CONFIRM, "i"),
    );
    this.messageEditInformation = page.getByText(
      new RegExp(MessageTextOperator.EDIT_INFO, "i"),
    );
    this.messageNoAccess = page.getByText(
      new RegExp(MessageTextOperatorSelect.NO_ACCESS, "i"),
    );
    this.messageNoAdminSetup = page.getByText(
      new RegExp(MessageTextOperatorSelect.NO_ADMIN, "i"),
    );
    this.messageSelectOperator = page.getByText(
      new RegExp(MessageTextOperatorSelect.SELECT_OPERATOR, "i"),
    );
  }

  // # Actions

  async acceptOperator() {
    await this.buttonYesThisIsMyOperator.click();
  }

  async clickEditInformation() {
    await this.buttonEdit.click();
  }

  async clickAddOperator() {
    await this.linkAddOperator.click();
  }

  async clickSaveAndReturn() {
    //If the button is clickable (i.e., enabled), then clicking it will not throw any errors. If the button is not clickable (i.e., disabled), the click action will fail with an appropriate error.
    await this.buttonSaveAndReturn.click();
  }

  async clickSubmitButton() {
    await this.buttonSubmit.click();
  }

  async editOperatorInformation() {
    await this.fieldLegalName.fill(E2EValue.INPUT_LEGAL_NAME);
  }

  async fillInformation(selector: string) {
    await fillAllFormFields(this.page, selector);
  }

  async requestAccess() {
    await this.buttonRequestAccess.click();
  }

  async requestAdmin() {
    await this.buttonRequestAdministratorAccess.click();
  }

  async routeBack() {
    await this.linkGoBack.click();
  }

  async route() {
    await this.page.goto(this.url);
  }

  async routeReturn() {
    await this.linkReturn.click();
  }

  async selectByCraNumber(craNumber: string) {
    await this.fieldSearchByCRA.click();
    await this.fieldSelectCRA.click();
    await this.fieldSelectCRA.fill(craNumber);
    await this.buttonSearchOperator.click();
  }

  async selectByLegalName(name: string, legalName: string) {
    await this.fieldSelectLegalName.click();
    await this.fieldSelectLegalName.fill(name);
    await this.page.getByRole("option", { name: legalName }).click();
    await this.buttonSelectOperator.click();
  }

  async triggerErrorsFieldFormat() {
    await this.fieldBCCrn.fill(E2EValue.INPUT_BAD_BC_CRN);
    await this.fieldPostal.fill(E2EValue.INPUT_BAD_POSTAL);
    await this.fieldWebSite.fill(E2EValue.INPUT_BAD_WEB_SITE);
    await this.clickSubmitButton();
  }

  async triggerErrorsFieldRequired() {
    await this.clickSubmitButton();
    // ❗ Add short timeout to mitigate the Firefox text rendering issue causing spurious screenshot failures
    await this.page.waitForTimeout(500);
  }

  // # Assertions

  async formIsDisabled() {
    const allFormFields = await getAllFormInputs(this.page);
    await checkFormFieldsReadOnly(allFormFields);
  }

  async formIsEnabled() {
    const allFormFields = await getAllFormInputs(this.page);
    await checkFormFieldsReadOnly(allFormFields, false);
  }

  async formIsSubmitted() {
    await this.clickSubmitButton();
    await this.page.waitForResponse((response) => response.status() === 200, {
      timeout: 30000,
    });
    await this.msgAddOperatorIsVisible();
  }

  async formIsVisible() {
    await expect(this.form).toBeVisible();
  }

  async formTitleIsVisible() {
    await expect(this.formTitle).toBeVisible();
  }

  async formViewIsCorrect() {
    await this.msgEditInformationIsVisible();
    await this.formTitleIsVisible();
    await expect(this.buttonEdit).toBeVisible();
    await expect(this.buttonSaveAndReturn).toBeVisible();
  }

  async msgAccessRequestedIsVisible() {
    await expect(this.messageAccessRequested).toBeVisible();
  }

  async msgAddOperatorIsVisible() {
    await expect(this.messageAddOperatorRequested).toBeVisible();
  }

  async msgAdminRequestedIsVisible() {
    await expect(this.messageAdministratorRequested).toBeVisible();
  }

  async msgConfirmationIsVisible() {
    await expect(this.messageConfirmation).toBeVisible();
  }

  async msgEditInformationIsVisible() {
    await expect(this.messageEditInformation).toBeVisible();
  }

  async msgEditInformationIsNotVisible() {
    await expect(this.messageEditInformation).toBeHidden();
  }

  async msgNoAccessIsVisible() {
    await expect(this.messageNoAccess).toBeVisible();
  }

  async msgNoAdminSetupIsVisible() {
    await expect(this.messageNoAdminSetup).toBeVisible();
  }

  async msgSelectOpertorIsVisible() {
    await expect(this.messageSelectOperator).toBeVisible();
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = this.page.url();
    expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }
}
