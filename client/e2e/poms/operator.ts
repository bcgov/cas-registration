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
  FormTextOperator,
  FormTextOperatorSelect,
  MessageTextOperator,
  MessageTextOperatorSelect,
} from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
import { getFieldAlerts, getFieldRequired } from "@/e2e/utils/helpers";
dotenv.config({ path: "./e2e/.env.local" });

export class OperatorPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.OPERATOR;

  readonly buttonEdit: Locator;

  readonly buttonRequestAccess: Locator;

  readonly buttonRequestAdministratorAccess: Locator;

  readonly buttonSaveAndReturn: Locator;

  readonly buttonSelectOperator: Locator; // legal name search

  readonly buttonSearchOperator: Locator; // CRA number search

  readonly buttonSubmit: Locator;

  readonly buttonYesThisIsMyOperator: Locator;

  readonly fieldCRA: Locator;

  readonly fieldLegalName: Locator;

  readonly fieldSearchByCRA: Locator;

  readonly formTitle: Locator;

  readonly linkAddOperator: Locator;

  readonly linkGoBack: Locator;

  readonly linkReturn: Locator;

  readonly messageAccessRequested: Locator;

  readonly messageEditInformation: Locator;

  readonly messageAdministratorRequested: Locator;

  readonly messageConfirmation: Locator;

  readonly messageNoAccess: Locator;

  readonly messageNoAdminSetup: Locator;

  readonly messageSelectOperator: Locator;

  constructor(page: Page) {
    this.page = page;
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
    this.linkAddOperator = page.getByRole("link", {
      name: ButtonText.ADD_OPERATION,
    });
    this.linkGoBack = page.getByRole("link", {
      name: ButtonText.GO_BACK,
    });
    this.linkReturn = page.getByText(ButtonText.RETURN);
    this.fieldCRA = page.getByPlaceholder(FormTextOperatorSelect.INPUT_CRA);
    this.fieldLegalName = page.getByPlaceholder(
      FormTextOperatorSelect.INPUT_LEGAL_NAME
    );
    this.fieldSearchByCRA = page.getByLabel(
      FormTextOperatorSelect.SEARCH_BY_CANADA_REVENUE
    );
    this.formTitle = page.getByText(FormTextOperator.TITLE);
    this.messageAccessRequested = page.getByText(
      new RegExp(`(${MessageTextOperatorSelect.REQUEST_ACCESS})`, "i")
    );
    this.messageAdministratorRequested = page.getByText(
      new RegExp(`(${MessageTextOperatorSelect.REQUEST_ADMIN})`, "i")
    );
    this.messageConfirmation = page.getByText(
      new RegExp(`(${MessageTextOperatorSelect.OPERATOR_CONFIRM})`, "i")
    );
    this.messageEditInformation = page.getByText(
      new RegExp(`(${MessageTextOperator.EDIT_INFO})`, "i")
    );
    this.messageNoAccess = page.getByText(
      new RegExp(`(${MessageTextOperatorSelect.NO_ACCESS})`, "i")
    );
    this.messageNoAdminSetup = page.getByText(
      new RegExp(`(${MessageTextOperatorSelect.NO_ADMIN})`, "i")
    );
    this.messageSelectOperator = page.getByText(
      new RegExp(`(${MessageTextOperatorSelect.SELECT_OPERATOR})`, "i")
    );
  }
  // # Actions

  async acceptOperator() {
    await this.buttonYesThisIsMyOperator.click();
  }

  async addOperator() {
    await this.linkAddOperator.click();
  }

  async clickSaveAndReturn() {
    //If the button is clickable (i.e., enabled), then clicking it will not throw any errors. If the button is not clickable (i.e., disabled), the click action will fail with an appropriate error.
    await this.buttonSaveAndReturn.click();
  }

  async clickEditInformation() {
    await this.buttonEdit.click();
  }

  async editOperatorInformation() {
    await this.fieldLegalName.fill(E2EValue.INPUT_LEGAL_NAME_NEW);
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
    await this.fieldCRA.click();
    await this.fieldCRA.fill(craNumber);
    await this.buttonSearchOperator.click();
  }

  async selectByLegalName(name: string, legalName: string) {
    await this.fieldLegalName.click();
    await this.fieldLegalName.fill(name);
    await this.page.getByText(legalName).click();
    await this.buttonSelectOperator.click();
  }

  // # Assertions

  async checkRequiredFieldValidationErrors() {
    // Locate all required fields
    const requiredFields = await getFieldRequired(this.page);
    // Submit
    await this.buttonSubmit.click();
    // Locate all alert elements within the fieldset
    const alertElements = await getFieldAlerts(this.page);
    // 🔍 Assert there to be exactly the same number of required fields and alert elements
    await expect(requiredFields?.length).toBe(alertElements.length);
  }

  async msgAdminRequestedIsVisible() {
    await expect(this.messageAdministratorRequested).toBeVisible();
  }

  async msgConfirmationIsVisible() {
    await expect(this.messageConfirmation).toBeVisible();
  }

  async msgNoAccessIsVisible() {
    await expect(this.messageNoAccess).toBeVisible();
  }

  async msgNoAdminSetupIsVisible() {
    await expect(this.messageNoAdminSetup).toBeVisible();
  }

  async msgAccessRequestedIsVisible() {
    await expect(this.messageAccessRequested).toBeVisible();
  }

  async msgSelectOpertorIsVisible() {
    await expect(this.messageSelectOperator).toBeVisible();
  }

  async operatorViewIsCorrect() {
    await expect(this.messageEditInformation).toBeVisible();
    await expect(this.formTitle).toBeVisible();
    await expect(this.buttonEdit).toBeVisible();
    await expect(this.buttonSaveAndReturn).toBeVisible();
  }

  async operatorFormIsDisabled() {
    await expect(this.fieldLegalName).toBeDisabled();
  }

  async operatorFormIsEnabled() {
    await expect(this.fieldLegalName).toBeDisabled();
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = await this.page.url();
    await expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }
}
