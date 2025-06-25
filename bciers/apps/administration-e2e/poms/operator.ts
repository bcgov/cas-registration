/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import {
  OperatorButtonText,
  OperatorE2EValue,
  OperatorFormField,
  MessageTextOperatorSelect,
  SelectOperatorFormField,
} from "@/administration-e2e/utils/enums";
import { ButtonText, UserRole } from "@bciers/e2e/utils/enums";
// 🛠️ Helpers
import {
  checkFormFieldsReadOnly,
  getAllFormInputs,
} from "@bciers/e2e/utils/helpers";
/**
 * OperatorPOM provides interaction methods for Operator forms and related actions.
 */
export class OperatorPOM {
  readonly page: Page;

  // Button Locators

  readonly buttonAddParentCompany: Locator;

  readonly buttonEdit: Locator;

  readonly buttonRequestAccess: Locator;

  readonly buttonRequestAdministratorAccess: Locator;

  readonly buttonSaveAndReturn: Locator;

  readonly buttonSelectOperator: Locator; // legal name search

  readonly buttonSearchOperator: Locator; // CRA number search

  readonly buttonSave: Locator;

  readonly buttonYesThisIsMyOperator: Locator;

  // Field Locators

  readonly fieldBCCrn: Locator;

  readonly fieldBusinessStructure: Locator;

  readonly fieldCRA: Locator;

  readonly fieldHasParentCompany: Locator;

  readonly fieldLegalName: Locator;

  readonly fieldPostal: Locator;

  readonly fieldSelectCRA: Locator;

  readonly fieldSelectLegalName: Locator;

  readonly fieldSearchByCRA: Locator;

  // Form Locators

  readonly form: Locator;

  readonly headerOperator: Locator;

  readonly headerOperatorAddress: Locator;

  readonly headerOperatorParent: Locator;

  // Link Locators

  readonly linkAddOperator: Locator;

  readonly linkGoBack: Locator;

  readonly linkReturn: Locator;

  // Message Locators

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
    // Initialize Button Locators
    this.buttonAddParentCompany = page.getByRole("button", {
      name: OperatorButtonText.ADD_PARENT_COMPANY,
    });
    this.buttonEdit = page.getByRole("button", {
      name: ButtonText.EDIT,
    });
    this.buttonSaveAndReturn = page.getByRole("button", {
      name: ButtonText.SAVE_RETURN_DASHBOARD,
    });
    this.buttonRequestAccess = page.getByRole("button", {
      name: OperatorButtonText.REQUEST_ACCESS,
    });
    this.buttonRequestAdministratorAccess = page.getByRole("button", {
      name: OperatorButtonText.REQUEST_ADMIN_ACCESS,
    });
    this.buttonSelectOperator = page.getByRole("button", {
      name: OperatorButtonText.SELECT_OPERATOR,
    });
    this.buttonSearchOperator = page.getByRole("button", {
      name: OperatorButtonText.SEARCH_OPERATOR,
    });
    this.buttonSave = page.getByRole("button", {
      name: /save/i,
    });
    this.buttonYesThisIsMyOperator = page.getByRole("button", {
      name: OperatorButtonText.YES_OPERATOR,
    });
    // Initialize Field Locators
    this.fieldBCCrn = page.getByLabel(OperatorFormField.BC_CRN);
    this.fieldBusinessStructure = page.getByLabel(
      OperatorFormField.BUSINESS_STRUCTURE,
    );
    this.fieldCRA = page.getByLabel(OperatorFormField.CRA);
    this.fieldLegalName = page.getByLabel(OperatorFormField.LEGAL_NAME).first();
    this.fieldHasParentCompany = page.getByLabel(
      OperatorFormField.HAS_PARENT_COMPANY,
    );
    this.fieldPostal = page.getByLabel(OperatorFormField.POSTAL_CODE);
    this.fieldSelectCRA =
      page.getByPlaceholder(SelectOperatorFormField.PLACEHOLDER_CRA) ||
      page.getByRole("textbox", {
        name: OperatorFormField.CRA_LABEL,
      });
    this.fieldSelectLegalName = page.getByPlaceholder(
      SelectOperatorFormField.PLACEHOLDER_LEGAL_NAME,
    );
    this.fieldSearchByCRA = page.getByLabel(
      SelectOperatorFormField.SEARCH_BY_CANADA_REVENUE,
    );
    // Initialize Form Locators
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
    // Initialize Link Locators
    this.linkAddOperator = page.getByRole("link", {
      name: OperatorButtonText.ADD_OPERATOR,
    });
    this.linkGoBack = page.getByRole("link", {
      name: ButtonText.GO_BACK,
    });
    this.linkReturn = page.getByText(ButtonText.RETURN);
    // Initialize Message Locators
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

  async clickAddOperator() {
    await this.linkAddOperator.click();
  }

  async clickEditInformation() {
    await this.buttonEdit.click();
  }

  async clickSaveAndReturn() {
    //If the button is clickable (i.e., enabled), then clicking it will not throw any errors. If the button is not clickable (i.e., disabled), the click action will fail with an appropriate error.
    await this.buttonSaveAndReturn.click();
  }

  async clickSubmitButton() {
    await this.buttonSubmit.click();
  }

  async editOperatorInformation() {
    await this.fieldLegalName.fill(OperatorE2EValue.INPUT_LEGAL_NAME);
  }

  async fillFields(fieldLabels: string[], values: { [key: string]: string }) {
    for (const labelText of fieldLabels) {
      // Get all matching input fields for the current field label
      console.log(`Filling field: ${labelText}`);
      const inputFields = await this.page.getByLabel(labelText);
      const inputField = inputFields.nth((await inputFields.count()) - 1);

      // Fill the field with the corresponding value from the values object
      switch (labelText) {
        case OperatorFormField.PROVINCE:
        case OperatorFormField.BUSINESS_STRUCTURE:
          await inputField.fill(values[labelText]);
          await this.page
            .getByRole("option", { name: values[labelText] })
            .click();
          break;
        default:
          await inputField.fill(values[labelText]);
          break;
      }
    }
  }

  async fillParentInformation() {
    // Trigger parent field display
    await this.fieldHasParentCompany.click();
    // Define fields and values for parent information
    const parentFields = [
      OperatorFormField.BUSINESS_ADDRESS,
      OperatorFormField.CRA_LABEL,
      OperatorFormField.LEGAL_NAME,
      OperatorFormField.MUNICIPALITY,
      OperatorFormField.POSTAL_CODE,
      OperatorFormField.PROVINCE,
    ];
    const parentValues = {
      [OperatorFormField.BUSINESS_ADDRESS]:
        OperatorE2EValue.INPUT_BUSINESS_ADDRESS_PARENT,
      [OperatorFormField.CRA_LABEL]: OperatorE2EValue.INPUT_CRA_PARENT,
      [OperatorFormField.LEGAL_NAME]: OperatorE2EValue.INPUT_LEGAL_NAME_PARENT,
      [OperatorFormField.MUNICIPALITY]:
        OperatorE2EValue.INPUT_MUNICIPALITY_PARENT,
      [OperatorFormField.POSTAL_CODE]:
        OperatorE2EValue.INPUT_POSTAL_CODE_PARENT,
      [OperatorFormField.PROVINCE]: OperatorE2EValue.INPUT_PROVINCE_PARENT,
    };

    // Use the helper function to fill parent fields
    await this.fillFields(parentFields, parentValues);
  }

  async fillPartnerInformation() {
    // Trigger partner field display based on business structure value == general partnership
    await this.fieldBusinessStructure.clear();
    await this.fieldBusinessStructure.fill(
      OperatorE2EValue.INPUT_BUSINESS_STRUCTRE_0,
    );
    await this.page
      .getByRole("option", { name: OperatorE2EValue.INPUT_BUSINESS_STRUCTRE_0 })
      .click();

    // Define fields and values for partner information
    const partnerFields = [
      OperatorFormField.BC_CRN,
      OperatorFormField.BUSINESS_STRUCTURE,
      OperatorFormField.CRA_LABEL,
      OperatorFormField.LEGAL_NAME,
    ];
    const partnerValues = {
      [OperatorFormField.BC_CRN]: OperatorE2EValue.INPUT_BC_CRN_PARTNER,
      [OperatorFormField.BUSINESS_STRUCTURE]:
        OperatorE2EValue.INPUT_BUSINESS_STRUCTRE_1,
      [OperatorFormField.CRA_LABEL]: OperatorE2EValue.INPUT_CRA_PARTNER,
      [OperatorFormField.LEGAL_NAME]: OperatorE2EValue.INPUT_LEGAL_NAME_PARTNER,
    };

    // Use the helper function to fill partner fields
    await this.fillFields(partnerFields, partnerValues);
  }

  async fillRequiredInformation() {
    // Define fields and values for requied information
    const requiredFields = [
      OperatorFormField.BC_CRN,
      OperatorFormField.BUSINESS_ADDRESS,
      OperatorFormField.BUSINESS_STRUCTURE,
      OperatorFormField.CRA_LABEL,
      OperatorFormField.LEGAL_NAME,
      OperatorFormField.MUNICIPALITY,
      OperatorFormField.POSTAL_CODE,
      OperatorFormField.PROVINCE,
    ];
    const requiredValues = {
      [OperatorFormField.BC_CRN]: OperatorE2EValue.INPUT_BC_CRN,
      [OperatorFormField.BUSINESS_ADDRESS]:
        OperatorE2EValue.INPUT_BUSINESS_ADDRESS,
      [OperatorFormField.BUSINESS_STRUCTURE]:
        OperatorE2EValue.INPUT_BUSINESS_STRUCTRE_1,
      [OperatorFormField.CRA_LABEL]: OperatorE2EValue.INPUT_CRA,
      [OperatorFormField.LEGAL_NAME]: OperatorE2EValue.INPUT_LEGAL_NAME,
      [OperatorFormField.MUNICIPALITY]: OperatorE2EValue.INPUT_MUNICIPALITY,
      [OperatorFormField.POSTAL_CODE]: OperatorE2EValue.INPUT_POSTAL_CODE,
      [OperatorFormField.PROVINCE]: OperatorE2EValue.INPUT_PROVINCE,
    };

    // Use the helper function to fill required fields
    await this.fillFields(requiredFields, requiredValues);
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
    await this.fieldCRA.fill(OperatorE2EValue.INPUT_BAD_CRA);
    await this.fieldBCCrn.fill(OperatorE2EValue.INPUT_BAD_BC_CRN);
    await this.fieldPostal.fill(OperatorE2EValue.INPUT_BAD_POSTAL);
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

  async formIsNotVisible() {
    await expect(this.form).not.toBeVisible();
  }

  async formHasHeaders() {
    await expect(this.headerOperator).toBeVisible();
    await expect(this.headerOperatorAddress).toBeVisible();
    await expect(this.headerOperatorParent).toBeVisible();
  }

  async hasOperatorAccess(role: string) {
    switch (role) {
      case UserRole.INDUSTRY_USER_ADMIN:
        await this.formIsVisible();
        break;
      default:
        await this.formIsNotVisible();
    }
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
