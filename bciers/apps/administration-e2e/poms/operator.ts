/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import {
  ButtonText,
  E2EValue,
  OperatorFormField,
  MessageTextOperatorSelect,
  SelectOperatorFormField,
} from "@/administration/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
import {
  checkFormFieldsReadOnly,
  getAllFormInputs,
  getFieldRequired,
} from "@/e2e/utils/helpers";
dotenv.config({ path: "./e2e/.env.local" });

export class OperatorPOM {
  readonly page: Page;

  readonly buttonAddParentCompany: Locator;

  readonly buttonRequestAccess: Locator;

  readonly buttonRequestAdministratorAccess: Locator;

  readonly buttonSelectOperator: Locator; // legal name search

  readonly buttonSearchOperator: Locator; // CRA number search

  readonly buttonSubmit: Locator;

  readonly buttonYesThisIsMyOperator: Locator;

  readonly fieldBCCrn: Locator;

  readonly fieldCRA: Locator;

  readonly fieldHasParentCompany: Locator;

  readonly fieldLegalName: Locator;

  readonly fieldPostal: Locator;

  readonly fieldSelectCRA: Locator;

  readonly fieldSelectLegalName: Locator;

  readonly fieldSearchByCRA: Locator;

  readonly form: Locator;

  readonly headerOperator: Locator;

  readonly headerOperatorAddress: Locator;

  readonly headerOperatorParent: Locator;

  readonly linkAddOperator: Locator;

  readonly linkGoBack: Locator;

  readonly linkReturn: Locator;

  readonly messageConfirmOperator: Locator;

  readonly messageRequestAccessConfirmed: Locator;

  readonly messageRequestAccessAdminConfirmed: Locator;

  readonly messageRequestAccessDeclined: Locator;

  readonly messageRequestAccessAdminDeclined: Locator;

  readonly messageNoAccess: Locator;

  readonly messageNoAdminSetup: Locator;

  readonly messageSelectOperator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.buttonAddParentCompany = page.getByRole("button", {
      name: ButtonText.ADD_PARENT_COMPANY,
    });

    this.buttonRequestAccess = page.getByRole("button", {
      name: ButtonText.REQUEST_ACCESS,
    });
    this.buttonRequestAdministratorAccess = page.getByRole("button", {
      name: ButtonText.REQUEST_ADMIN_ACCESS,
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
    this.fieldBCCrn = page.getByLabel(OperatorFormField.BC_CRN);
    this.fieldCRA = page.getByLabel(OperatorFormField.CRA);
    this.fieldLegalName = page.getByLabel(OperatorFormField.LEGAL_NAME);
    this.fieldHasParentCompany = page.locator(
      OperatorFormField.HAS_PARENT_COMPANY,
    );
    this.fieldPostal = page.getByLabel(OperatorFormField.POSTAL_CODE);
    this.fieldSelectCRA = page.getByPlaceholder(
      SelectOperatorFormField.PLACEHOLDER_CRA,
    );
    this.fieldSelectLegalName = page.getByPlaceholder(
      SelectOperatorFormField.PLACEHOLDER_LEGAL_NAME,
    );
    this.fieldSearchByCRA = page.getByLabel(
      SelectOperatorFormField.SEARCH_BY_CANADA_REVENUE,
    );

    this.form = page.locator(OperatorFormField.FORM);
    this.headerOperator = page.locator(
      `h2:has-text("${OperatorFormField.HEADER_OPERATOR}")`,
    );
    this.headerOperatorAddress = page.locator(
      `h2:has-text("${OperatorFormField.HEADER_OPERATOR_ADDRESS}")`,
    );
    this.headerOperatorParent = page.locator(
      `h2:has-text("${OperatorFormField.HEADER_OPERATOR_PARENT}")`,
    );
    this.linkAddOperator = page.getByRole("link", {
      name: ButtonText.ADD_OPERATOR,
    });
    this.linkGoBack = page.getByRole("link", {
      name: ButtonText.GO_BACK,
    });
    this.linkReturn = page.getByText(ButtonText.RETURN);

    this.messageRequestAccessDeclined = page.getByText(
      new RegExp(MessageTextOperatorSelect.REQUEST_ACCESS_DECLINED, "i"),
    );
    this.messageRequestAccessAdminDeclined = page.getByText(
      new RegExp(MessageTextOperatorSelect.REQUEST_ACCESS_ADMIN_DECLINED, "i"),
    );
    this.messageRequestAccessConfirmed = page.getByText(
      new RegExp(MessageTextOperatorSelect.REQUEST_ACCESS_CONFIRMED, "i"),
    );
    this.messageRequestAccessAdminConfirmed = page.getByText(
      new RegExp(MessageTextOperatorSelect.REQUEST_ACCESS_ADMIN_CONFIRMED, "i"),
    );
    this.messageConfirmOperator = page.getByText(
      new RegExp(MessageTextOperatorSelect.OPERATOR_CONFIRM, "i"),
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

  async clickSubmitButton() {
    await this.buttonSubmit.click();
  }

  async fillRequiredInformation() {
    // Complete required fields
    const fields = await getFieldRequired(this.page);
    // Iterate over each required field
    for (const input of fields) {
      const labelText = await input.textContent();
      const inputFields = await this.page.getByLabel(labelText as string);
      const inputField = inputFields.nth((await inputFields.count()) - 1);

      switch (labelText) {
        case OperatorFormField.LEGAL_NAME:
          await inputField.fill(E2EValue.INPUT_LEGAL_NAME);
          break;
        case OperatorFormField.CRA:
          await inputField.fill(E2EValue.INPUT_CRA);
          break;
        case OperatorFormField.BC_CRN:
          await inputField.fill(E2EValue.INPUT_BC_CRN);
          break;
        case OperatorFormField.BUSINESS_STRUCTURE:
          await inputField.fill(E2EValue.INPUT_BUSINESS_STRUCTRE_1);
          await this.page
            .getByRole("option", { name: E2EValue.INPUT_BUSINESS_STRUCTRE_1 })
            .click();
          break;
        case OperatorFormField.HAS_PARENT_COMPANY:
          break;
        case OperatorFormField.PROVINCE:
          await inputField.fill(E2EValue.INPUT_PROVINCE);
          await this.page
            .getByRole("option", { name: E2EValue.INPUT_PROVINCE })
            .click();
          break;
        case OperatorFormField.POSTAL_CODE:
          await inputField.fill(E2EValue.INPUT_POSTAL_CODE);
          break;
        default:
          await inputField.fill(`E2E ${labelText}`);
          break;
      }
    }
  }

  async requestAccess() {
    await this.buttonRequestAccess.click();
  }

  async requestAccessAdmin() {
    await this.buttonRequestAdministratorAccess.click();
  }

  async route(url: string) {
    await this.page.goto(process.env.E2E_BASEURL + url);
  }

  async routeBack() {
    await this.linkGoBack.click();
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
    this.buttonSelectOperator.click();
  }

  async triggerErrorsFieldFormat() {
    await this.fieldBCCrn.fill(E2EValue.INPUT_BAD_BC_CRN);
    await this.fieldPostal.fill(E2EValue.INPUT_BAD_POSTAL);
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
  }

  async formIsVisible() {
    await expect(this.form).toBeVisible();
  }

  async formHasHeaders() {
    await expect(this.headerOperator).toBeVisible();
    await expect(this.headerOperatorAddress).toBeVisible();
    await expect(this.headerOperatorParent).toBeVisible();
  }

  async msgRequestAccessConfirmedIsVisible() {
    await expect(this.messageRequestAccessConfirmed).toBeVisible();
  }

  async msgRequestAccessAdminConfirmedIsVisible() {
    await expect(this.messageRequestAccessAdminConfirmed).toBeVisible();
  }

  async msgRequestAccessDeclinedIsVisible() {
    await expect(this.messageRequestAccessDeclined).toBeVisible();
  }

  async msgRequestAccessAdminDeclinedIsVisible() {
    await expect(this.messageRequestAccessAdminDeclined).toBeVisible();
  }
  async msgConfirmOperatorIsVisible() {
    await expect(this.messageConfirmOperator).toBeVisible();
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

  async urlIsCorrect(expectedPath: string) {
    const currentUrl = await this.page.url();
    await expect(currentUrl.toLowerCase()).toMatch(expectedPath.toLowerCase());
  }
}
