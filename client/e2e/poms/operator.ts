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
  FieldTextOperatorSelect,
  MessageTextOperatorSelect,
} from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
import { getFieldAlerts, getFieldRequired } from "../utils/helpers";
dotenv.config({ path: "./e2e/.env.local" });

export class OperatorPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.OPERATOR;

  readonly buttonSelectOperator: Locator; // legal name search

  readonly buttonSearchOperator: Locator; // CRA number search

  readonly buttonYesThisIsMyOperator: Locator;

  readonly buttonRequestAdministratorAccess: Locator;

  readonly buttonRequestAccess: Locator;

  readonly buttonSubmit: Locator;

  readonly fieldInputCRA: Locator;

  readonly fieldInputLegalName: Locator;

  readonly fieldSearchByCRA: Locator;

  readonly linkAddOperator: Locator;

  readonly linkGoBack: Locator;

  readonly linkReturn: Locator;

  readonly messageAccessRequested: Locator;

  readonly messageAdministratorRequested: Locator;

  readonly messageConfirmation: Locator;

  readonly messageNoAccess: Locator;

  readonly messageNoAdminSetup: Locator;

  readonly messageSelectOperator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.buttonSelectOperator = page.getByRole("button", {
      name: ButtonText.SELECT_OPERATOR,
    });
    this.buttonSearchOperator = page.getByRole("button", {
      name: ButtonText.SEARCH_OPERATOR,
    });
    this.buttonYesThisIsMyOperator = page.getByRole("button", {
      name: ButtonText.YES_OPERATOR,
    });
    this.buttonRequestAdministratorAccess = page.getByRole("button", {
      name: ButtonText.REQUEST_ADMIN_ACCESS,
    });
    this.buttonRequestAccess = page.getByRole("button", {
      name: ButtonText.REQUEST_ACCESS,
    });
    this.linkAddOperator = page.getByRole("link", {
      name: ButtonText.ADD_OPERATION,
    });
    this.linkGoBack = page.getByRole("link", {
      name: ButtonText.GO_BACK,
    });
    this.linkReturn = page.getByText(ButtonText.RETURN);
    this.buttonSubmit = page.getByRole("button", {
      name: ButtonText.SUBMIT,
    });
    this.fieldInputCRA = page.getByPlaceholder(
      FieldTextOperatorSelect.INPUT_CRA,
    );
    this.fieldInputLegalName = page.getByPlaceholder(
      FieldTextOperatorSelect.INPUT_LEGAL_NAME,
    );
    this.fieldSearchByCRA = page.getByLabel(
      FieldTextOperatorSelect.SEARCH_BY_CANADA_REVENUE,
    );
    this.messageAccessRequested = page.getByText(
      new RegExp(`(${MessageTextOperatorSelect.REQUEST_ACCESS})`, "i"),
    );
    this.messageAdministratorRequested = page.getByText(
      new RegExp(`(${MessageTextOperatorSelect.REQUEST_ADMIN})`, "i"),
    );
    this.messageConfirmation = page.getByText(
      new RegExp(`(${MessageTextOperatorSelect.OPERATOR_CONFIRM})`, "i"),
    );
    this.messageNoAccess = page.getByText(
      new RegExp(`(${MessageTextOperatorSelect.NO_ACCESS})`, "i"),
    );
    this.messageNoAdminSetup = page.getByText(
      new RegExp(`(${MessageTextOperatorSelect.NO_ADMIN})`, "i"),
    );
    this.messageSelectOperator = page.getByText(
      new RegExp(`(${MessageTextOperatorSelect.SELECT_OPERATOR})`, "i"),
    );
  }

  async route() {
    await this.page.goto(this.url);
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = await this.page.url();
    await expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }

  async addOperator() {
    await this.linkAddOperator.click();
  }

  async acceptOperator() {
    await this.buttonYesThisIsMyOperator.click();
  }

  async routeBack() {
    await this.linkGoBack.click();
  }

  async routeReturn() {
    await this.linkReturn.click();
  }

  async requestAccess() {
    await this.buttonRequestAccess.click();
  }

  async requestAdmin() {
    await this.buttonRequestAdministratorAccess.click();
  }

  async msgAdminRequestedIsVisible() {
    await expect(this.messageAdministratorRequested).toBeVisible();
  }

  async selectByCraNumber(craNumber: string) {
    await this.fieldSearchByCRA.click();
    await this.fieldInputCRA.click();
    await this.fieldInputCRA.fill(craNumber);
    await this.buttonSearchOperator.click();
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

  async selectByLegalName(name: string, legalName: string) {
    await this.fieldInputLegalName.click();
    await this.fieldInputLegalName.fill(name);
    await this.page.getByText(legalName).click();
    await this.buttonSelectOperator.click();
  }

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
}
