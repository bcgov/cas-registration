/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import { AppRoute } from "@/e2e/utils/enums";
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

  readonly linkAddOperator: Locator;

  readonly confirmationMessage: RegExp;

  readonly buttonEdit: Locator;

  readonly buttonSaveAndReturn: Locator;

  readonly editInformationNote =
    /Please click on the "Edit Information" button/i;

  readonly operatorFormTitle = /Operator Information/i;

  readonly legalNameField: Locator;

  constructor(page: Page) {
    this.page = page;
    this.confirmationMessage =
      /Kindly confirm if this is the operator that you represent./i;
    this.buttonSelectOperator = this.page.getByRole("button", {
      name: /select operator/i,
    });
    this.buttonSearchOperator = this.page.getByRole("button", {
      name: /search operator/i,
    });
    this.buttonYesThisIsMyOperator = this.page.getByRole("button", {
      name: /yes this is my operator/i,
    });
    this.buttonRequestAdministratorAccess = this.page.getByRole("button", {
      name: /request administrator access/i,
    });
    this.buttonRequestAccess = this.page.getByRole("button", {
      name: /request access/i,
    });
    this.linkAddOperator = this.page.getByRole("link", {
      name: /add operator/i,
    });
    this.buttonSubmit = this.page.getByRole("button", {
      name: /submit/i,
    });

    this.buttonEdit = page.getByRole("button", {
      name: /edit information/i,
    });
    this.buttonSaveAndReturn = page.getByRole("button", {
      name: /save and return to dashboard/i,
    });

    this.legalNameField = page.getByLabel(/Legal Name*/i);
  }

  async route() {
    await this.page.goto(this.url);
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = await this.page.url();
    await expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }

  async selectByCraNumber(craNumber: string) {
    await this.page.getByLabel("Search by Canada Revenue").check();

    await this.page.getByPlaceholder("Enter CRA Business Number").click();
    await this.page
      .getByPlaceholder("Enter CRA Business Number")
      .fill(craNumber);
    await this.buttonSearchOperator.click();
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

  async operatorViewIsCorrect() {
    await expect(this.page.getByText(this.editInformationNote)).toBeVisible();
    await expect(this.page.getByText(this.operatorFormTitle)).toBeVisible();
    await expect(this.buttonEdit).toBeVisible();
    await expect(this.buttonSaveAndReturn).toBeVisible();
  }

  async operatorFormIsDisabled() {
    await expect(this.legalNameField).toBeDisabled();
  }

  async operatorFormIsEnabled() {
    await expect(this.legalNameField).toBeEnabled();
  }

  async clickEditInformation() {
    expect(this.buttonEdit).toBeEnabled();
    await this.buttonEdit.click();
    expect(this.operatorFormIsEnabled).toBeTruthy();
  }

  async clickSaveAndReturn() {
    expect(this.buttonSaveAndReturn).toBeEnabled();
    await this.buttonSaveAndReturn.click();
  }

  async editOperatorInformation() {
    await this.legalNameField.fill("New Legal Name");
  }
}
